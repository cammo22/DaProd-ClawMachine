// Controlli automatici di DaProd Claw Machine.
//
//   npm i --no-save playwright@1.62.0 && node test/prove.mjs
//
// Apre il gioco in Chromium headless (serve la rete: three.js e cannon-es arrivano dalla CDN,
// come nel gioco vero) e lo gioca: moneta, discesa, fondo, RIALZA gratis, attesa senza scelta,
// PRENDI a pagamento, fine delle risalite, tempo scaduto. Misura quanto resta in ogni fase del
// braccio (niente blocchi) e conta le lire (mai prese senza che il giocatore lo chieda).
// Salva due immagini in test/.out/ per guardare pinza e display.
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = path.join(ROOT, 'test', '.out');
fs.mkdirSync(OUT, { recursive: true });
const PORT = 8200 + Math.floor(Math.random() * 700);
const server = http.createServer((req, res) => {
  let f = decodeURIComponent(req.url.split('?')[0]);
  if (f === '/') f = '/index.html';
  const p = path.join(ROOT, f);
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); return res.end('no'); }
  res.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream' });
  res.end(fs.readFileSync(p));
});
await new Promise(r => server.listen(PORT, r));

let ok = 0, ko = 0;
const T = (nome, cond, extra = '') => {
  if (cond) { ok++; console.log('  ✔', nome, extra); } else { ko++; console.log('  ✘', nome, extra); }
};

const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
const page = await (await browser.newContext({ viewport: { width: 800, height: 600 } })).newPage();
const errori = [];
page.on('console', m => { if (m.type() === 'error') errori.push(m.text()); });
page.on('pageerror', e => errori.push(String(e)));
await page.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
await page.goto(`http://127.0.0.1:${PORT}/index.html`);
await page.waitForFunction(() => !!window.__CLAW, null, { timeout: 30000 });

// Tutti i tempi sono TEMPO DI GIOCO (G.clock): in Chromium headless il rendering è software, i
// fotogrammi sono pochi e il gioco (dt al massimo 0,05 s per fotogramma) scorre più piano
// dell'orologio. Un "blocco" è tempo di gioco fermo in una fase, non lentezza della macchina.
// Registra ogni cambio di fase dentro la pagina (non dipende da quanto spesso guardiamo).
await page.evaluate(() => {
  const C = window.__CLAW; window.__log = []; let prev = null;
  const tick = () => {
    if (C.G.phase !== prev) { window.__log.push({ ph: C.G.phase, t: C.G.clock || 0 }); prev = C.G.phase; }
    requestAnimationFrame(tick);
  };
  tick();
});
const orologio = () => page.evaluate(() => window.__CLAW.G.clock || 0);
const stato = () => page.evaluate(() => {
  const { G, S } = window.__CLAW;
  return { phase: G.phase, lire: S.lire, raises: G.raises, running: G.running, over: G.over, timeLeft: G.timeLeft };
});
const aspetta = async (cond, max = 90000) => {       // max in ms reali: larghi, la misura vera è in tempo di gioco
  const t0 = Date.now();
  while (Date.now() - t0 < max) { const s = await stato(); if (cond(s)) return s; await page.waitForTimeout(100); }
  return null;
};
const visibile = id => page.evaluate(i => !document.getElementById(i).classList.contains('hidden'), id);

console.log('\n== AVVIO ==');
T('il gioco parte con la fisica attiva', await page.evaluate(() => window.__CLAW.physOn));
T('la pinza ha 3 artigli', await page.evaluate(() => window.__CLAW.fingers.length === 3));
await page.evaluate(() => { document.getElementById('startScreen').style.display = 'none'; });

console.log('\n== MONETA E DISCESA ==');
const s0 = await stato();
await page.evaluate(() => window.__CLAW.startRound());
const s1 = await stato();
T('la partita costa 100 lire', s0.lire - s1.lire === 100, `${s0.lire} → ${s1.lire}`);
await page.waitForTimeout(1800);                       // tuffo della camera
await page.evaluate(() => window.__CLAW.doDrop());
let t0 = await orologio();
let s = await aspetta(x => x.phase === 'bottom');
T('la pinza arriva giù in fretta', !!s && (await orologio()) - t0 < 2.5, s ? `${((await orologio()) - t0).toFixed(1)} s di gioco` : 'mai arrivata');
T('giù si ferma e aspetta (nessuna lira presa)', s && s.lire === s1.lire && s.raises === 0);
T('giù ci sono PRENDI e RIALZA', await visibile('raiseBtn') && await visibile('freeBtn'));
await page.screenshot({ path: path.join(OUT, 'fondo.png') });

console.log('\n== RIALZA GRATIS ==');
await page.click('#freeBtn');
t0 = await orologio();
s = await aspetta(x => x.phase === 'idle');
T('RIALZA riporta su la pinza', !!s && (await orologio()) - t0 < 4.5, s ? `${((await orologio()) - t0).toFixed(1)} s di gioco` : 'non torna');
T('RIALZA non costa niente e non consuma risalite', s && s.lire === s1.lire && s.raises === 0, s ? `${s.lire} lire, risalite ${s.raises}` : '');

console.log('\n== NESSUNA SCELTA SUL FONDO ==');
await page.evaluate(() => window.__CLAW.doDrop());
await aspetta(x => x.phase === 'bottom');
s = await aspetta(x => x.phase !== 'bottom');
// la durata si legge dal registro delle fasi: noi ce ne accorgiamo sempre un po' in ritardo
const attesa = await page.evaluate(() => {
  const L = window.__log, i = L.map(e => e.ph).lastIndexOf('bottom');
  return i >= 0 && L[i + 1] ? L[i + 1].t - L[i].t : -1;
});
T('dopo 5 s senza scelta risale da sola', !!s && attesa > 4.5 && attesa < 6, `${attesa.toFixed(1)} s di gioco`);
s = await aspetta(x => x.phase === 'idle');
T('…gratis', s && s.lire === s1.lire && s.raises === 0);

console.log('\n== PRENDI (risalita a pagamento) ==');
await page.evaluate(() => window.__CLAW.doDrop());
await aspetta(x => x.phase === 'bottom');
await page.click('#raiseBtn');
s = await stato();
T('PRENDI costa 200 lire e consuma una risalita', s1.lire - s.lire === 200 && s.raises === 1, `${s.lire} lire, risalite ${s.raises}`);
t0 = await orologio();
s = await aspetta(x => x.phase === 'idle' || x.over);
T('il ciclo completo torna a riposo', !!s && (await orologio()) - t0 < 14, s ? `${((await orologio()) - t0).toFixed(1)} s di gioco` : 'bloccato');

console.log('\n== PRENDI A MEZZ\'ARIA E FINE RISALITE ==');
if (!s.over) {
  const prima = s.lire;
  await page.evaluate(() => window.__CLAW.doDrop());
  await aspetta(x => x.phase === 'down');
  const fase = (await stato()).phase;
  await page.evaluate(() => window.__CLAW.doRaise());
  s = await stato();
  T('PRENDI funziona anche durante la discesa', fase === 'down' && s.raises === 2 && prima - s.lire === 500, `fase ${fase}, ${prima - s.lire} lire`);
  s = await aspetta(x => x.over);
  T('finite le risalite: GAME OVER', !!s);
} else {
  T('PRENDI funziona anche durante la discesa', false, 'partita già finita');
}

console.log('\n== TEMPO SCADUTO MENTRE È GIÙ ==');
await page.evaluate(() => { const { S } = window.__CLAW; S.lire = Math.max(S.lire, 5000); });
await page.evaluate(() => window.__CLAW.startRound());
await page.waitForTimeout(300);
await page.evaluate(() => window.__CLAW.doDrop());
await aspetta(x => x.phase === 'bottom');
const l2 = (await stato()).lire;
await page.evaluate(() => { window.__CLAW.G.timeLeft = 0.2; });
s = await aspetta(x => x.over);
T('tempo scaduto sul fondo: risale gratis e GAME OVER', !!s && s.lire === l2, s ? `${s.lire} lire` : 'nessun game over');

console.log('\n== NIENTE BLOCCHI ==');
const log = await page.evaluate(() => window.__log);
const durate = {};
for (let i = 0; i < log.length - 1; i++) {
  const d = log[i + 1].t - log[i].t;                  // secondi di gioco
  durate[log[i].ph] = Math.max(durate[log[i].ph] || 0, d);
}
const lunghe = Object.entries(durate).filter(([ph, d]) => ph !== 'idle' && d > 6.5);
T('nessuna fase del braccio oltre 6,5 s di gioco', lunghe.length === 0,
  Object.entries(durate).map(([p, d]) => `${p} ${d.toFixed(1)}s`).join(' · '));
const auto = await page.evaluate(() => document.body.innerText.includes('Autorestart'));
T('nessun autorestart del watchdog', !auto);

console.log('\n== IMMAGINI ==');
await page.evaluate(() => { document.getElementById('gameOver').classList.add('hidden'); });
await page.waitForTimeout(2500);
await page.screenshot({ path: path.join(OUT, 'cabinato.png') });
console.log('  immagini in', OUT);

T('nessun errore JavaScript', errori.length === 0, errori.slice(0, 3).join(' | '));

await browser.close();
server.close();
console.log(`\n==== ${ok} OK · ${ko} KO ====`);
process.exit(ko ? 1 : 0);
