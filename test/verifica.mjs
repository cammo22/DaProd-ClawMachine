/**
 * Verifica automatica di DaProd Claw Machine.
 * Apre il gioco in un browser vero e controlla che non si blocchi mai.
 *
 *   npm i -D playwright-core
 *   node test/verifica.mjs        (usa CHROME_EXE per indicare il browser)
 */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.resolve(import.meta.dirname, '..');
const CHROME = process.env.CHROME_EXE
  || path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright', 'chromium-1234', 'chrome-win64', 'chrome.exe');

let pass = 0, fail = 0;
const ok = (m) => { pass++; console.log('  OK   ' + m); };
const ko = (m) => { fail++; console.log('  FAIL ' + m); };
const check = (cond, m) => cond ? ok(m) : ko(m);

/* ---------- server statico minimo ---------- */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (url === '/favicon.ico') { res.writeHead(204); return res.end(); }
  const file = path.join(ROOT, url === '/' ? 'index.html' : url);
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = 'http://127.0.0.1:' + server.address().port;

/* ---------- browser ---------- */
const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--mute-audio']
});
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errori = [];
page.on('pageerror', e => errori.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errori.push('console: ' + m.text()); });

const S = () => page.evaluate(() => {
  const c = window.__CLAW;
  return { credits: c.S.credits, running: c.G.running, phase: c.G.phase, prizes: c.prizeCount(),
           paid: c.G.paid, disabled: document.getElementById('dropBtn').disabled,
           label: document.getElementById('dropBtn').textContent, phys: c.physOn };
});

console.log('\n=== DaProd Claw Machine — verifica automatica ===\n');

/* 1. avvio */
console.log('1) Avvio');
await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
let started = true;
try { await page.waitForFunction(() => !!window.__CLAW, null, { timeout: 45000 }); }
catch { started = false; }
check(started, 'il gioco si carica (three + cannon + stato esposto)');
if (!started) { console.log(errori.join('\n')); await browser.close(); server.close(); process.exit(1); }
const fisica = (await S()).phys;
check(fisica, 'motore fisico cannon-es attivo');
await page.waitForTimeout(3000);
const pieno = (await S()).prizes;
check(pieno > 20, 'cabinato pieno: ' + pieno + ' premi');

/* 2. ingresso in sala (gratis) */
console.log('\n2) Ingresso in sala');
const prima = await S();
await page.click('#playBtn');
await page.waitForTimeout(400);
const dopo = await S();
check(dopo.credits === prima.credits, 'entrare in sala non costa gettoni (' + dopo.credits + ' disponibili)');
check(dopo.running === true, 'sessione avviata');

/* 3. lancio completo: 1 gettone per lancio, non si blocca mai */
console.log('\n3) Lancio del braccio (1 gettone per lancio)');
const creditiPreLancio = (await S()).credits;
const addebitiPrima = await page.evaluate(() => window.__CLAW.S.charges || 0);
await page.evaluate(() => window.__CLAW.doDrop());
await page.waitForTimeout(500);
const durante = await S();
check(durante.credits === creditiPreLancio - 1, 'il lancio costa esattamente 1 gettone (' + creditiPreLancio + ' -> ' + durante.credits + ')');
await page.evaluate(() => window.__CLAW.doDrop());
await page.waitForTimeout(300);
const addebitiDopo = await page.evaluate(() => window.__CLAW.S.charges || 0);
check(addebitiDopo === addebitiPrima + 1, 'un solo addebito anche premendo piu volte (addebiti: ' + addebitiDopo + ')');
const fasi = new Set(); let bloccato = false, minDente = 0;
const t0 = Date.now();
while (Date.now() - t0 < 25000) {
  const st = await page.evaluate(() => {
    const c = window.__CLAW;
    let minY = 0;
    c.fingers.forEach(f => { if (f.position.y < minY) minY = f.position.y; });
    return { phase: c.G.phase, minY };
  });
  fasi.add(st.phase);
  if (st.minY < minDente) minDente = st.minY;
  if (st.phase === 'idle') break;
  if (Date.now() - t0 > 20000) { bloccato = true; break; }
  await page.waitForTimeout(60);
}
const durata = ((Date.now() - t0) / 1000).toFixed(1);
check(!bloccato, 'il braccio completa il ciclo senza bloccarsi (' + durata + 's)');
check(fasi.has('down') && fasi.has('lift'), 'fasi percorse: ' + [...fasi].join(' > '));
check(minDente < -0.09, 'i 9 denti si PIEGANO davvero (gancio ' + minDente.toFixed(3) + ')');
const addebitiFine = await page.evaluate(() => window.__CLAW.S.charges || 0);
check(addebitiFine === addebitiPrima + 1, 'il gettone e scalato una volta sola, mai due');
check((await S()).disabled === false, 'pulsante di nuovo attivo a fine ciclo');

/* 4. nessuna scadenza: il gettone pagato non si perde mai */
console.log('\n4) Nessuna scadenza');
await page.waitForTimeout(2500);
const attesa = await S();
const addebitiAttesa = await page.evaluate(() => window.__CLAW.S.charges || 0);
check(addebitiAttesa === addebitiPrima + 1, 'aspettando non parte nessun altro addebito');
check(attesa.credits >= creditiPreLancio - 1, 'i gettoni non vengono mangiati (' + attesa.credits + ' disponibili)');
check(attesa.paid === false && attesa.phase === 'idle', 'il prossimo lancio richiede un nuovo gettone (stato pulito)');
const chip = await page.evaluate(() => document.getElementById('timer').textContent);
check(chip.length > 0, 'il chip mostra lo stato del braccio: "' + chip + '"');

/* 5. zero gettoni: nessun blocco, nessun gettone mangiato */
console.log('\n5) Gettoni a zero (mai blocchi)');
await page.evaluate(() => { const c = window.__CLAW; c.S.credits = 0; c.S._lastFree = Date.now(); });
await page.evaluate(() => window.__CLAW.doDrop());
await page.waitForTimeout(600);
const zero = await S();
check(zero.credits === 0, 'con 0 gettoni non viene scalato nulla (restano ' + zero.credits + ')');
check(zero.phase === 'idle' && zero.paid === false, 'nessun lancio a vuoto, nessun blocco');
check(zero.disabled === false, 'pulsante ancora utilizzabile (mai bloccato)');
const avviso = await page.evaluate(() => document.body.innerText.indexOf('GETTONI') >= 0);
check(avviso, 'il gioco avvisa che servono gettoni');

/* 5b. rete di sicurezza: gettoni gratis automatici */
await page.evaluate(() => { const c = window.__CLAW; c.S.credits = 0; c.S._lastFree = Date.now() - 120000; });
await page.waitForTimeout(500);
const gratis = await S();
check(gratis.credits > 0, 'a secco scatta il bonus automatico (+' + gratis.credits + ' gettoni)');

/* 6. watchdog: da stato bloccato torna giocabile */
console.log('\n6) Watchdog anti-blocco');
await page.evaluate(() => { const c = window.__CLAW; c.G.phase = 'fall'; c.G.fall = null; c.G._ph = 'forzato'; });
let recuperato = true;
try { await page.waitForFunction(() => window.__CLAW.G.phase === 'idle', null, { timeout: 12000, polling: 200 }); }
catch { recuperato = false; }
check(recuperato, 'dopo un blocco forzato il gioco si rimette a posto da solo');

/* 7. fluidita */
console.log('\n7) Prestazioni');
const fps = await page.evaluate(() => new Promise(res => {
  let n = 0; const t = performance.now();
  (function f() { n++; if (performance.now() - t < 2000) requestAnimationFrame(f); else res(Math.round(n / ((performance.now() - t) / 1000))); })();
}));
console.log('  INFO fps headless/software: ' + fps + ' (su GPU reale molto piu alto)');
check(fps > 5, 'il rendering non si blocca mai (fps > 5 anche in rendering software)');

const shot = path.join(os.tmpdir(), 'claw-verifica.png');
await page.screenshot({ path: shot });
console.log('  screenshot: ' + shot);

/* 8. errori javascript */
console.log('\n8) Errori JavaScript');
check(errori.length === 0, errori.length ? errori.slice(0, 6).join(' | ') : 'nessun errore in console');

await browser.close();
server.close();
console.log('\n=== ' + pass + ' passati, ' + fail + ' falliti ===\n');
process.exit(fail ? 1 : 0);
