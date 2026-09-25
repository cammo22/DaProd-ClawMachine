// Controlli automatici di DaProd Claw Machine.
//
//   npm i --no-save playwright three@0.160.0 && npx playwright install chromium && node test/prove.mjs
//
// Apre il gioco in un browser vero (Chromium headless) su computer, su telefono e con salvataggi
// vecchi o rovinati, e verifica: avvio senza errori, le cinque zone piene, la presa (costo, fasi del
// carroponte che finiscono sempre, prima presa garantita), la buca, le tre teste, gli shiny, il
// potenziamento dei gradi, lo sblocco delle zone, la fisica (niente NaN, niente fughe), il salvataggio,
// la vetrina, l'officina, le modalità della home (demo e sfilata) e la pagina index.html.
// Tutti i tempi sono TEMPO DI GIOCO (simula): nel rendering software i fotogrammi sono pochissimi.
// Se three.js e' installato in locale (node_modules) viene servito da li', addon compresi.
import { chromium } from 'playwright';
import { avviaServer } from './servi.mjs';

const { server, base, url } = await avviaServer(Number(process.env.PORT) || undefined);

let ok = 0, ko = 0;
const T = (nome, cond, extra = '') => {
  if (cond) { ok++; console.log('  ✔', nome, extra); }
  else { ko++; console.log('  ✘', nome, extra); }
};

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });

// una presa completa in tempo di gioco: paga, scende, chiude, sale, porta alla buca, torna
const AIUTI = () => {
  window.__presa = (x, z, extra = 2.5) => {
    const C = window.CLAW, prima = C.stato.lire, fasi = new Set();
    if (x !== undefined) C.bersaglio(x, z);
    const partita = C.prendi();
    let t = 0;
    while (t < 25 && (C.pinza.prenota || C.pinza.fase !== 'libera' || t < .05)) { C.simula(.05); t += .05; fasi.add(C.pinza.fase); }
    C.simula(extra);
    return { partita, t, fasi: [...fasi], speso: prima - C.stato.lire };
  };
};
async function nuovaPagina(opz = {}, salvataggi = null, dove = url) {
  const ctx = await browser.newContext(opz);
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());   // i font non servono alle prove
  const page = await ctx.newPage();
  const errori = [];
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errori.push(m.text()); });
  page.on('pageerror', e => errori.push(String(e)));
  if (salvataggi) {
    await page.addInitScript(sv => {
      if (sessionStorage.getItem('provaCaricata')) return;
      sessionStorage.setItem('provaCaricata', '1');
      try { localStorage.clear(); for (const k in sv) localStorage.setItem(k, sv[k]); } catch (e) {}
    }, salvataggi);
  }
  await page.addInitScript(AIUTI);
  await page.goto(dove, { waitUntil: 'commit' });
  if (dove.includes('/gioca/')) await page.waitForFunction(() => !!window.CLAW, null, { timeout: 180000, polling: 250 });
  return { ctx, page, errori };
}

// ============================================================ COMPUTER
console.log('\n== COMPUTER ==');
{
  const { ctx, page, errori } = await nuovaPagina({ viewport: { width: 1280, height: 800 } }, { vuoto: '1' });
  await page.waitForTimeout(1500);
  T('nessun errore in console', errori.length === 0, errori.join(' | '));
  T('un solo canvas', await page.locator('canvas').count() === 1);
  T('nessun avviso di errore a schermo', await page.locator('#erroreGioco').count() === 0);
  const v = await page.evaluate(() => CLAW.VERSIONE);
  T('versione nel marchio', (await page.locator('#versione').textContent()) === v, v);
  T('il caricamento sparisce', await page.locator('#caricamento.via').count() === 1);
  T('schermata iniziale visibile', await page.locator('#intro').isVisible());
  T('logo DaProd nell\'HUD e nella schermata iniziale', await page.locator('svg.logoDP').count() >= 2);
  T('8 gradi nella schermata iniziale', await page.locator('#scalaGradi span').count() === 8);

  const dati = await page.evaluate(() => ({ modelli: CLAW.MODELLI.length, zone: CLAW.ZONE.length, gradi: CLAW.GRADI.length - 1,
    perZona: CLAW.ZONE.map((z, i) => CLAW.oggetti().filter(o => o.zona === i).length), lire: CLAW.stato.lire,
    famiglie: CLAW.ZONE.map((z, i) => CLAW.MODELLI.filter(m => m.zona === i).length), tri: CLAW.triangoli() }));
  T('20 modellini, 5 zone, 8 gradi', dati.modelli === 20 && dati.zone === 5 && dati.gradi === 8);
  T('4 modellini per zona', dati.famiglie.every(n => n === 4), dati.famiglie.join(' '));
  T('le cinque zone sono piene', dati.perZona.every(n => n >= 40), dati.perZona.join(' '));
  T('si parte con L.2.000', dati.lire === 2000);
  T('modellini leggeri (meno di 4.000 triangoli)', dati.tri.every(n => n > 0 && n < 4000), Math.max(...dati.tri) + ' max');
  T('i modellini si disegnano per lotti instanziati', await page.evaluate(() => CLAW.lotti().length) > 10);
  const fisica = await page.evaluate(() => {
    const o = CLAW.oggetti();
    return { nan: o.filter(x => ![x.x, x.y, x.z].every(Number.isFinite)).length,
      fuori: o.filter(x => Math.abs(x.x - CLAW.cxZona(x.zona)) > 6.01 || Math.abs(x.z) > 5.01).length,
      sotto: o.filter(x => x.y < x.r - .05 && !CLAW.sopraBuca(x.x, x.z, x.zona)).length,
      dormono: o.filter(x => x.dorme).length / o.length };
  });
  T('fisica: nessun NaN', fisica.nan === 0);
  T('fisica: nessun modellino fuori dalla sua zona', fisica.fuori === 0);
  T('fisica: nessuno sprofonda nel pavimento', fisica.sotto === 0);
  T('fisica: il mucchio si assesta e dorme', fisica.dormono > .8, (fisica.dormono * 100).toFixed(0) + '%');

  // --- GIOCA ---
  // force: sul runner di GitHub (due core, WebGL in software) la vasca si
  // mangia tutti i fotogrammi, e Playwright aspetta due fotogrammi fermi prima
  // di dire che il tasto e' «stabile»: non arrivano mai e la prova cadeva al
  // 30esimo secondo. Il tasto non si muove; il clic resta un clic vero.
  await page.locator('#giocaBtn').click({ force: true });
  await page.waitForTimeout(900);
  T('GIOCA chiude la schermata iniziale', await page.evaluate(() => CLAW.inGioco()) && await page.locator('#intro.via').count() === 1);
  T('tre teste nella barra, la pinza scelta', await page.locator('#teste .testa').count() === 3 && await page.locator('#teste .testa.sel').getAttribute('data-t') === 'pinza');
  T('amo e rete bloccati all\'inizio', await page.locator('#teste .testa.bloccata').count() === 2);

  // --- LA BUCA ---
  const b = await page.evaluate(() => { const bu = CLAW.buca(0); CLAW.bersaglio(bu.x, bu.z); CLAW.simula(1.5); const l = CLAW.stato.lire; const r = CLAW.prendi(); return { r, speso: l - CLAW.stato.lire }; });
  T('sopra la buca non si cala e non si paga', b.r === false && b.speso === 0);

  // --- PRIMA PRESA ---
  const p1 = await page.evaluate(() => __presa(1.2, -1));
  const dopo1 = await page.evaluate(() => ({ coll: Object.keys(CLAW.stato.coll).length, st: CLAW.stato.st, lire: CLAW.stato.lire }));
  T('la presa costa L.100 (poi arriva il premio)', p1.partita && dopo1.st.spesi === 100);
  T('il carroponte passa per tutte le fasi', ['scende', 'chiude', 'sale', 'porta', 'apre', 'torna'].every(f => p1.fasi.includes(f)), p1.fasi.join('>'));
  T('una presa intera dura meno di 12 s di gioco', p1.t < 12, p1.t.toFixed(1) + ' s');
  T('la prima presa è garantita: un modellino in vetrina', dopo1.coll >= 1 && dopo1.st.catturati >= 1, JSON.stringify(dopo1.coll));
  T('il premio in lire arriva', dopo1.st.vinti > 0, 'L.' + Math.round(dopo1.st.vinti));
  T('la rete di sicurezza non è servita', dopo1.st.sicurezza === 0);
  T('dopo la vincita il pulsante vetrina lampeggia', await page.locator('#vetrinaBtn.nuovo').count() === 1);
  T('dopo la presa il cavo torna libero', await page.evaluate(() => CLAW.pinza.fase === 'libera' && CLAW.pinza.presi.length === 0));

  // --- MOLTE PRESE DI FILA: niente blocchi, le lire non vanno mai sotto zero ---
  const lunga = await page.evaluate(() => {
    CLAW.stato.lire = 100000; const out = { durate: [], neg: false, blocchi: 0 };
    for (let i = 0; i < 30; i++) {
      const x = -5 + Math.random() * 10, z = -4.4 + Math.random() * 6.5;
      const r = __presa(x, z, .6); out.durate.push(r.t);
      if (!r.partita) out.blocchi++;
      if (CLAW.stato.lire < 0) out.neg = true;
    }
    const o = CLAW.oggetti();
    out.nan = o.filter(x => ![x.x, x.y, x.z, x.vx, x.vy, x.vz].every(Number.isFinite)).length;
    out.fuori = o.filter(x => x.stato === 'campo' && (Math.abs(x.x - CLAW.cxZona(x.zona)) > 6.01 || Math.abs(x.z) > 5.01)).length;
    out.sicurezza = CLAW.stato.st.sicurezza; out.presi = CLAW.stato.st.catturati; out.vuote = CLAW.stato.st.vuote;
    out.zona0 = o.filter(x => x.zona === 0).length;
    return out;
  });
  T('30 prese di fila: ognuna parte', lunga.blocchi === 0, lunga.blocchi + ' rifiutate');
  T('30 prese di fila: ognuna finisce entro 12 s', Math.max(...lunga.durate) < 12, Math.max(...lunga.durate).toFixed(1) + ' s max');
  T('30 prese di fila: mai serve la rete di sicurezza', lunga.sicurezza === 0);
  T('30 prese di fila: le lire non vanno sotto zero', !lunga.neg);
  T('30 prese di fila: fisica sana', lunga.nan === 0 && lunga.fuori === 0);
  T('la pinza prende davvero (e a volte no)', lunga.presi >= 8 && lunga.vuote >= 1, `${lunga.presi} presi, ${lunga.vuote} a vuoto`);
  await page.evaluate(() => CLAW.simula(8));
  T('la zona si riempie di nuovo', await page.evaluate(() => CLAW.oggetti().filter(o => o.zona === 0).length) >= 70);

  // --- SENZA LIRE ---
  const povero = await page.evaluate(() => { CLAW.stato.lire = 50; const r = CLAW.prendi(); return { r, lire: CLAW.stato.lire }; });
  T('senza lire la presa non parte e non si paga', povero.r === false && povero.lire === 50);
  // Si resta poveri finche' il bonus non arriva: la rendita della collezione
  // dipende da quanti modellini ha preso la pinza qui sopra (a caso), e con
  // tanti presi le lire passavano la soglia prima dei 5 secondi. Sul runner di
  // GitHub, 28 presi: il bonus non scattava mai.
  const cortesia = await page.evaluate(() => { for (let i = 0; i < 60; i++) { if (CLAW.stato.lire < 1000) CLAW.stato.lire = 50; CLAW.rendimento(.1); } return CLAW.stato.lire; });
  T('bonus di cortesia: arriva L.1.000', cortesia >= 1000, 'L.' + Math.round(cortesia));
  const limite = await page.evaluate(() => {
    const C = CLAW; C.stato.cortesie = []; const esiti = [];
    for (let i = 0; i < 7; i++) esiti.push(C.bonusDiCortesia());
    const dati = esiti.filter(Boolean).length;
    C.stato.cortesie = C.stato.cortesie.map(t => t - 7 * 3600e3);
    return { dati, tornano: C.bonusDiCortesia() };
  });
  T('bonus di cortesia: al massimo 5 ogni 6 ore, poi tornano', limite.dati === 5 && limite.tornano === true, JSON.stringify(limite));

  // --- LE TRE TESTE ---
  const teste = await page.evaluate(() => {
    const C = CLAW, out = {};
    C.stato.lire = 50000;
    out.amoComprato = C.compraTesta('amo'); out.reteComprata = C.compraTesta('rete');
    out.lire = C.stato.lire;
    C.FORZA.presa = true;
    C.scegliTesta('rete'); const n0 = C.stato.st.catturati;
    // un mucchio sotto la rete
    for (let k = 0; k < 7; k++) C.nuovoOggetto(0, 1, 0, -3 + (k % 3) * .9, 1.2 + Math.floor(k / 3), -2 + (k % 2) * .5);
    C.simula(2); out.rete = __presa(-2.1, -1.8); out.presiRete = C.stato.st.catturati - n0;
    out.capRete = C.capEff(C.TESTE.rete);
    C.scegliTesta('amo'); const n1 = C.stato.st.catturati;
    const bersaglio = C.oggetti().filter(o => o.zona === 0 && o.stato === 'campo' && !C.sopraBuca(o.x, o.z, 0)).sort((a, b) => (b.y - a.y))[0];
    const sp = C.stato.st.spesi;
    out.amo = __presa(bersaglio.x, bersaglio.z); out.presiAmo = C.stato.st.catturati - n1;
    out.costoAmo = C.stato.st.spesi - sp; C.FORZA.presa = false;
    C.scegliTesta('pinza');
    return out;
  });
  T('amo e rete si comprano in officina', teste.amoComprato && teste.reteComprata && teste.lire === 50000 - 4000 - 12000);
  T('la rete acchiappa più modellini insieme', teste.presiRete >= 3 && teste.presiRete <= teste.capRete, teste.presiRete + '/' + teste.capRete);
  // 1.1.4: l'amo ne pesca fino a due (i piu' preziosi) e costa meta' presa.
  T('l\'amo ne pesca uno o due', teste.presiAmo >= 1 && teste.presiAmo <= 2, String(teste.presiAmo));
  T('l\'amo costa meta\' della pinza', teste.costoAmo === 50, 'L.' + teste.costoAmo);

  // --- SCIVOLA ---
  const sciv = await page.evaluate(() => {
    const C = CLAW; C.stato.lire = 5000; C.FORZA.presa = true; C.FORZA.scivola = true;
    const s0 = C.stato.st.scivolati, v0 = C.stato.st.vuote;
    // Si mira a un modellino vero: un punto fisso a volte e' vuoto (il mucchio
    // si sposta con le prese di prima) e la pinza non ha niente da far scivolare.
    const b = C.oggetti().filter(o => o.zona === 0 && o.stato === 'campo' && !C.sopraBuca(o.x, o.z, 0)).sort((a, c) => (c.y - a.y))[0];
    const r = __presa(b.x, b.z); C.FORZA.presa = false; C.FORZA.scivola = false;
    return { sc: C.stato.st.scivolati - s0, vuote: C.stato.st.vuote - v0, fasi: r.fasi };
  });
  T('un modellino può scivolare dalla pinza e ricade nella vasca', sciv.sc >= 1 && sciv.vuote === 1, JSON.stringify(sciv));

  // --- SHINY E GRADI ---
  const shiny = await page.evaluate(() => {
    const C = CLAW; C.stato.lire = 100000; C.FORZA.presa = true;
    delete C.stato.coll.pinguino;
    const x = 4, z = -3.2;
    for (const o of C.oggetti()) if (o.zona === 0 && Math.hypot(o.x - x, o.z - z) < 1.8) o.stato = 'via';
    C.nuovoOggetto(3, 4, 0, x, 1, z); C.simula(1.5);
    const r = __presa(x, z); C.FORZA.presa = false;
    return { r: r.partita, rec: C.stato.coll.pinguino, pot: C.potenzaTotale() };
  });
  T('un pinguino ORO preso: grado 4 subito', shiny.rec && shiny.rec.g === 4, JSON.stringify(shiny.rec));
  T('uno shiny di grado 4 vale 8 copie', shiny.rec && shiny.rec.c >= 8);
  const pot = await page.evaluate(() => {
    const C = CLAW; const r = C.stato.coll.pinguino; const M = C.MODELLI[3];
    const p0 = C.potenzaTotale(), l0 = C.stato.lire;
    r.c = 29; const no = C.potenzia(3);                  // servono 30 copie per OLOGRAFICO
    r.c = 30; C.stato.lire = 10; const noSoldi = C.potenzia(3);
    C.stato.lire = 100000; const si = C.potenzia(3);
    return { no, noSoldi, si, g: r.g, dp: C.potenzaTotale() - p0, speso: 100000 - C.stato.lire, atteso: M.valore * 50 };
  });
  T('senza copie non si potenzia', pot.no === false);
  T('senza lire non si potenzia', pot.noSoldi === false);
  T('con copie e lire si sale di grado', pot.si === true && pot.g === 5);
  T('il potenziamento costa il giusto', pot.speso === pot.atteso, 'L.' + pot.speso);
  T('la potenza cresce', pot.dp > 0);

  // --- ZONE ---
  const zone = await page.evaluate(() => {
    const C = CLAW; const out = {};
    C.stato.coll = {}; C.ricalcola(); C.stato.lire = 1e6;
    out.senzaPotenza = C.sblocca(1);
    C.stato.coll = { orsetto: { g: 3, c: 7 }, coniglio: { g: 3, c: 7 }, rana: { g: 2, c: 3 } }; C.ricalcola();
    out.potenza = C.potenzaTotale();
    out.salto = C.sblocca(3);
    out.si = C.sblocca(1); out.lire = C.stato.lire;
    C.bersaglio(C.cxZona(1), 0); C.simula(4);
    out.x = C.pinza.x; out.zona = C.zonaDi(C.pinza.x);
    C.bersaglio(C.cxZona(2), 0); C.simula(3); out.nonOltre = C.zonaDi(C.pinza.x);
    out.costo = C.costoPresa(1, 'pinza');
    const sp0 = C.stato.st.spesi; __presa(C.cxZona(1) + 1, -1); out.speso = C.stato.st.spesi - sp0;
    return out;
  });
  T('una zona non si apre senza potenza', zone.senzaPotenza === false);
  T('le zone si aprono in ordine', zone.salto === false);
  T('con potenza e lire la zona 2 si apre', zone.si === true && zone.lire === 1e6 - 7500, 'potenza ' + zone.potenza);
  T('la pinza va nella zona 2', zone.zona === 1);
  T('la pinza non entra nella zona chiusa', zone.nonOltre === 1);
  T('nella zona 2 la presa costa L.400', zone.costo === 400 && zone.speso === 400, 'L.' + zone.speso);
  await page.waitForTimeout(600);
  T('l\'HUD mostra la zona 2', (await page.locator('#zonaNome').textContent()).includes('GIOCATTOLERIA'));

  // --- OFFICINA ---
  await page.locator('#officinaBtn').click();
  await page.waitForTimeout(500);
  T('l\'officina si apre', await page.locator('#officina:not(.chiuso)').count() === 1);
  T('sei potenziamenti in officina', await page.locator('#contenutoOff [data-pot]').count() === 6);
  const off = await page.evaluate(() => { const C = CLAW; C.stato.lire = 10000; const p0 = C.presaEff(C.TESTE.pinza); const r = C.compra('presa'); return { r, dp: C.presaEff(C.TESTE.pinza) - p0, lire: C.stato.lire, liv: C.stato.pot.presa }; });
  T('comprare PRESA FORTE alza la presa', off.r && off.liv === 1 && off.dp > .03 && off.lire === 10000 - 1250);   // 1.1.4: tutto costa due volte e mezzo
  for (const s of ['teste', 'opz', 'stat']) {
    await page.locator(`#schedeOff [data-scheda="${s}"]`).click(); await page.waitForTimeout(150);
    T(`scheda ${s} dell'officina`, await page.locator('#contenutoOff > *').count() > 0);
  }
  await page.locator('#chiudiOff').click();

  // --- VETRINA ---
  await page.evaluate(() => { CLAW.stato.coll.orsetto = { g: 2, c: 8 }; CLAW.ricalcola(); });
  await page.locator('#vetrinaBtn').click();
  await page.waitForTimeout(800);
  T('la vetrina si apre', await page.evaluate(() => CLAW.vetrinaAperta()) && await page.locator('#vetrina:not(.chiuso)').count() === 1);
  T('20 caselle nella vetrina', await page.locator('#griglia .cella').count() === 20);
  T('le miniature sono immagini vere', await page.evaluate(() => [...document.querySelectorAll('#griglia .cella img')].every(i => i.src.startsWith('data:image/png') && i.src.length > 800)));
  T('i modellini da trovare sono sagome ???', await page.locator('#griglia .cella.ignota').count() >= 10);
  const vbox = await page.locator('#vetrina .lato').boundingBox();
  T('la vetrina e a schermo intero', vbox && vbox.width >= 1270 && vbox.height >= 700, JSON.stringify(vbox));
  await page.locator('#griglia .cella[data-m="0"]').click();
  await page.waitForTimeout(300);
  T('toccato un modellino: il palco a tutto schermo, la griglia sparisce', await page.locator('#vetrina.dettaglio').count() === 1 && await page.locator('#griglia').isHidden() && await page.locator('#indietroVet').isVisible());
  T('la scheda mostra il grado', (await page.locator('#scheda').textContent()).includes('BRONZO'));
  T('il pulsante POTENZIA è pronto', await page.locator('#potenziaBtn:not([disabled])').count() === 1);
  await page.evaluate(() => { CLAW.stato.lire = 100000; });
  await page.locator('#potenziaBtn').click();
  await page.waitForTimeout(400);
  T('POTENZIA dalla vetrina: orsetto ARGENTO', await page.evaluate(() => CLAW.stato.coll.orsetto.g) === 3);
  await page.locator('#chiudiVet').click();
  T('nessun errore dopo tutto il giro', errori.length === 0, errori.join(' | '));

  // --- LA FINE (1.1.3): tutti e 20 i modellini ---
  const fine = await page.evaluate(() => { const c = JSON.stringify(CLAW.stato.coll); const prima = CLAW.finita();
    for (const m of CLAW.MODELLI) CLAW.stato.coll[m.id] = { g: 1, c: 1 }; const dopo = CLAW.finita();
    CLAW.stato.coll = JSON.parse(c); return { prima, dopo }; });
  T('la partita e\' finita con tutti e 20 i modellini, non prima', !fine.prima && fine.dopo, JSON.stringify(fine));
  // 1.1.4: il pannello della fine, col punteggio che diventa euro.
  const pannello = await page.evaluate(async () => {
    CLAW.stato.lire = 6.1e9; CLAW.mostraLaFine(); await new Promise(r => setTimeout(r, 1900));
    const r = { visto: !document.getElementById('fine').hidden, lire: document.getElementById('fineLire').textContent,
      premio: document.getElementById('finePremio').textContent, tasto: document.getElementById('fineBtn').textContent,
      stima: [CLAW.premioStimato(1e3), CLAW.premioStimato(1e11)] };
    document.getElementById('fine').hidden = true; return r; });
  T('alla fine il pannello fa vedere le lire di gioco e il premio in euro', pannello.visto && pannello.lire === 'L.6,1 mld' && /€ 2\d,\d\d/.test(pannello.premio), JSON.stringify(pannello));
  T('il premio va da 20 a 30 euro', pannello.stima[0] === 20 && pannello.stima[1] === 30, JSON.stringify(pannello.stima));
  T('fuori dalla sala il tasto ricomincia da capo', /RICOMINCIA/.test(pannello.tasto), pannello.tasto);

  // --- LUCI E QUALITÀ (1.1.2) ---
  T('luci: due luci colorate per le zone, non una per zona', await page.evaluate(() => CLAW.luciAccese()) === 2);
  const lisci = await page.evaluate(() => { const o = CLAW.stato.opz.qualita;
    CLAW.stato.opz.qualita = 'bassa'; CLAW.qualita(); const b = CLAW.MAT.filter(Boolean).every(m => m.clearcoat === 0 && m.iridescence === 0);
    CLAW.stato.opz.qualita = 'alta'; CLAW.qualita(); const a = CLAW.MAT.filter(Boolean).some(m => m.clearcoat > 0) && CLAW.MAT.filter(Boolean).some(m => m.iridescence > 0);
    CLAW.stato.opz.qualita = o; CLAW.qualita(); return { b, a }; });
  T('in bassa i peluche perdono lucido e iridescenza, in alta li riprendono', lisci.b && lisci.a, JSON.stringify(lisci));

  // --- AVVISI (1.1.2, come nel Dozer) ---
  await page.evaluate(() => { document.getElementById('avvisi').innerHTML = ''; CLAW.avviso('prova normale', 'cia'); CLAW.avviso('prova importante', 'rosso imp'); });
  const av = await page.locator('#avvisi .avviso').first().boundingBox();
  T('avvisi: su computer stanno sul bordo sinistro', av && av.x < 40 && av.width <= 310, JSON.stringify(av));
  await page.locator('#scritteBtn').click();
  T('avvisi: col 💬 spento restano solo gli importanti', await page.evaluate(() => {
    const [n, i] = document.querySelectorAll('#avvisi .avviso');
    return !CLAW.stato.opz.scritte && getComputedStyle(n).display === 'none' && getComputedStyle(i).display !== 'none';
  }));
  await page.locator('#scritteBtn').click();
  T('avvisi: il 💬 le riaccende', await page.evaluate(() => CLAW.stato.opz.scritte && !document.body.classList.contains('senzaScritte')));

  // --- SALVATAGGIO ---
  const prima = await page.evaluate(() => { CLAW.salva(); return { lire: Math.round(CLAW.stato.lire), g: CLAW.stato.coll.orsetto.g, zone: CLAW.stato.zone.filter(Boolean).length, n: CLAW.stato.vasca.length }; });
  await page.reload({ waitUntil: 'commit' });
  await page.waitForFunction(() => !!window.CLAW, null, { timeout: 180000, polling: 250 });
  const dopo = await page.evaluate(() => ({ lire: Math.round(CLAW.stato.lire), g: CLAW.stato.coll.orsetto && CLAW.stato.coll.orsetto.g, zone: CLAW.stato.zone.filter(Boolean).length, n: CLAW.oggetti().length }));
  T('salvataggio: lire, gradi e zone restano', dopo.lire >= prima.lire && dopo.g === prima.g && dopo.zone === prima.zone, JSON.stringify([prima, dopo]));
  T('salvataggio: il mucchio della vasca torna com\'era', Math.abs(dopo.n - prima.n) < 30, `${prima.n} → ${dopo.n}`);
  T('bentornato nella schermata iniziale', (await page.locator('#bentornato').textContent()).length > 5);
  await ctx.close();
}

// ============================================================ TELEFONO
console.log('\n== TELEFONO ==');
{
  const { ctx, page, errori } = await nuovaPagina({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true }, { vuoto: '1' });
  await page.waitForTimeout(1200);
  T('telefono: nessun errore', errori.length === 0, errori.join(' | '));
  const dim = await page.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return [r.width, r.height]; });
  T('telefono: il canvas copre esattamente lo schermo', dim[0] === 390 && dim[1] === 844, dim.join('x'));
  T('telefono: meno modellini e qualità media', await page.evaluate(() => CLAW.oggetti().filter(o => o.zona === 0).length <= 50 && CLAW.stato.opz.qualita === 'media'));
  await page.locator('#giocaBtn').tap();
  await page.waitForTimeout(600);
  const t0 = await page.evaluate(() => [CLAW.pinza.tx, CLAW.pinza.tz]);
  await page.touchscreen.tap(120, 430);
  await page.waitForTimeout(300);
  const t1 = await page.evaluate(() => [CLAW.pinza.tx, CLAW.pinza.tz]);
  T('telefono: toccando la vasca la pinza cambia bersaglio', Math.hypot(t1[0] - t0[0], t1[1] - t0[1]) > .3, JSON.stringify([t0, t1]));
  const pb = await page.locator('#prendiBtn').boundingBox();
  T('telefono: PRENDI grande e dentro lo schermo', pb && pb.width >= 80 && pb.x + pb.width <= 390 && pb.y + pb.height <= 844);
  await page.locator('#prendiBtn').tap();
  await page.waitForTimeout(300);
  T('telefono: PRENDI parte', await page.evaluate(() => CLAW.pinza.prenota || CLAW.pinza.fase !== 'libera'));
  await page.evaluate(() => { document.getElementById('avvisi').innerHTML = ''; for (let i = 0; i < 4; i++) CLAW.avviso('avviso ' + i); });
  const pill = await page.evaluate(() => [...document.querySelectorAll('#avvisi .avviso')].filter(e => getComputedStyle(e).display !== 'none').map(e => { const r = e.getBoundingClientRect(); return [r.x, r.width, r.height]; }));
  T('telefono: avvisi piccoli al centro, al massimo due', pill.length === 2 && pill.every(([x, w, h]) => x > 0 && x + w < 390 && h < 30), JSON.stringify(pill));
  T('telefono: c\'è il tasto per le scritte', await page.locator('#scritteBtn').isVisible());
  T('telefono: niente vetro sfocato sopra il 3D', await page.evaluate(() => getComputedStyle(document.querySelector('#saldoBox')).backdropFilter === 'none'));
  await ctx.close();
}

// ============================================================ SALVATAGGI VECCHI E ROVINATI
console.log('\n== SALVATAGGI ==');
{
  const v2 = JSON.stringify({ lire: 7300, bag: { Orsetto: 9, Coniglietto: 2, Corona: 1, Stella: 3 }, sound: false, up: { grip: 2 } });
  const { ctx, page, errori } = await nuovaPagina({ viewport: { width: 1024, height: 700 } }, { daprod_claw_v2: v2 });
  await page.waitForTimeout(800);
  const s = await page.evaluate(() => ({ lire: CLAW.stato.lire, o: CLAW.stato.coll.orsetto, c: CLAW.stato.coll.coniglio, audio: CLAW.stato.opz.audio, corona: CLAW.stato.coll.corona }));
  T('vecchio salvataggio v0.x: nessun errore', errori.length === 0, errori.join(' | '));
  T('v0.x: le lire restano (più i premi senza equivalente)', s.lire >= 7300 + 4 * 300 && s.lire < 7300 + 4 * 300 + 100, String(Math.round(s.lire)));
  T('v0.x: 9 orsetti diventano un orsetto ARGENTO con 9 copie', s.o && s.o.g === 3 && s.o.c === 9, JSON.stringify(s.o));
  T('v0.x: 2 coniglietti = grado 1 con 2 copie', s.c && s.c.g === 1 && s.c.c === 2);
  T('v0.x: la corona non salta le zone', !s.corona);
  T('v0.x: l\'audio spento resta spento', s.audio === false);
  await ctx.close();
}
{
  const rotto = JSON.stringify({ lire: 'tanti', coll: { orsetto: { g: 99, c: -4 }, pippo: { g: 2 } }, zone: [true, true, 'x', true], pot: { presa: 1e9 }, vasca: [[1, 2], 'no', [0, 9, 0, 0, 1, 0]], testa: 'bazooka' });
  const { ctx, page, errori } = await nuovaPagina({ viewport: { width: 1024, height: 700 } }, { daprod_claw_v3: rotto });
  await page.waitForTimeout(800);
  const s = await page.evaluate(() => ({ lire: CLAW.stato.lire, o: CLAW.stato.coll.orsetto, pippo: CLAW.stato.coll.pippo, zone: CLAW.stato.zone, pot: CLAW.stato.pot.presa, testa: CLAW.stato.testa, n: CLAW.oggetti().length }));
  T('salvataggio rovinato: nessun errore', errori.length === 0, errori.join(' | '));
  T('salvataggio rovinato: valori riportati nei limiti', s.lire >= 2000 && s.lire < 3000 && s.o.g === 8 && s.o.c === 1 && !s.pippo && s.pot === 8 && s.testa === 'pinza', JSON.stringify(s));
  T('salvataggio rovinato: le zone si aprono solo in ordine', s.zone[1] === true && s.zone[2] === false && s.zone[3] === false);
  T('salvataggio rovinato: la vasca si riempie da capo', s.n > 150);
  await ctx.close();
}

// ============================================================ HOME
console.log('\n== HOME ==');
{
  const { ctx, page, errori } = await nuovaPagina({ viewport: { width: 1280, height: 800 } }, null, url + '?demo');
  await page.waitForTimeout(500);
  const d = await page.evaluate(() => { const C = CLAW; for (let i = 0; i < 40; i++) { C.bot(1); C.simula(.5); } return { r: C.raccolti(), prese: C.stato.st.prese, modo: C.MODO }; });
  T('demo: la macchina gioca da sola', d.modo === 'demo' && d.prese >= 3 && d.r >= 1, JSON.stringify(d));
  T('demo: niente HUD', !(await page.locator('#hud').isVisible()));
  T('demo: nessun errore', errori.length === 0, errori.join(' | '));
  T('demo: non salva niente', await page.evaluate(() => localStorage.getItem('daprod_claw_v3')) === null);
  await ctx.close();
}
{
  const { ctx, page, errori } = await nuovaPagina({ viewport: { width: 800, height: 600 } }, null, url + '?vetrina');
  await page.waitForTimeout(3000);
  T('sfilata: parte senza errori', errori.length === 0 && await page.evaluate(() => CLAW.MODO) === 'vetrina', errori.join(' | '));
  T('sfilata: mostra il nome del modellino', (await page.locator('#didNome').textContent()).length > 3);
  await ctx.close();
}
{
  const { ctx, page, errori } = await nuovaPagina({ viewport: { width: 1280, height: 800 } }, null, base + 'index.html');
  await page.waitForTimeout(2500);
  T('home: nessun errore', errori.length === 0, errori.join(' | '));
  T('home: pulsante GIOCA verso gioca/', await page.locator('a[href="gioca/"]').count() >= 1);
  T('home: download per Android, Windows e Mac', await page.locator('[data-os="android"]').count() === 1 && await page.locator('[data-os="windows"]').count() === 1 && await page.locator('[data-os="mac"]').count() === 1);
  T('home: la macchina gioca nello sfondo', await page.locator('iframe[src*="demo"]').count() === 1);
  await ctx.close();
}

await browser.close();
server.close();
console.log(`\n${ok} OK, ${ko} KO`);
process.exit(ko ? 1 : 0);
