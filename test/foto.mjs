// Foto del gioco, per guardare come viene dopo una modifica grafica.
//
//   node test/foto.mjs [scena] [nome]
//
// scena: vasca (la zona con la pinza ferma), presa (pinza sul fondo), shiny (un modellino per grado),
//        vetrina (la collezione), intro (schermata iniziale), demo (la home: la macchina gioca da sola),
//        sfilata (la home: i gradi uno dopo l'altro), home (la pagina index.html)
// Salva test/.out/<nome>.png e <nome>-telefono.png (computer e telefono).
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { avviaServer, ROOT } from './servi.mjs';

const OUT = path.join(ROOT, 'test', '.out');
fs.mkdirSync(OUT, { recursive: true });
const scenaFoto = process.argv[2] || 'vasca';
const nome = process.argv[3] || scenaFoto;
const { server, base, url } = await avviaServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
const dispositivi = [['', { viewport: { width: 1280, height: 800 } }],
  ['-telefono', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }]];
if (process.env.SOLO === 'computer') dispositivi.pop();
if (process.env.SOLO === 'telefono') dispositivi.shift();
for (const [suff, opz] of dispositivi) {
  const ctx = await browser.newContext(opz);
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());   // niente rete per i font nelle prove
  const page = await ctx.newPage();
  const errori = [];
  page.on('pageerror', e => errori.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errori.push(m.text()); });
  const dove = scenaFoto === 'demo' ? url + '?demo' : scenaFoto === 'sfilata' ? url + '?vetrina' : scenaFoto === 'home' ? base + 'index.html' : url;
  await page.goto(dove, { waitUntil: 'commit' });
  if (scenaFoto !== 'home') await page.waitForFunction(() => !!window.CLAW, null, { timeout: 120000, polling: 500 });
  await page.evaluate((s) => {
    if (!window.CLAW) return;
    const C = window.CLAW;
    if (s === 'intro' || s === 'demo' || s === 'sfilata') return;
    C.gioca(); document.getElementById('intro').style.display = 'none';
    C.stato.lire = 50000;
    if (s === 'presa') { C.bersaglio(C.cxZona(0) + 1.2, -.5); C.simula(1.2); C.prendi(); C.simula(1.02); }
    if (s === 'shiny') {
      C.pulisciZona(0);
      for (let g = 1; g <= 8; g++) for (let k = 0; k < 3; k++) C.nuovoOggetto(k * 4 + (g % 4), g, 0, -4.6 + (g - 1) * 1.3, 1 + k, -2.5 + k * 1.6);
      C.bersaglio(0, -2); C.simula(2.5);
    }
    if (s === 'vasca') { C.bersaglio(C.cxZona(0) + 1.2, -.5); C.simula(1.5); }
    if (s === 'vetrina') {
      for (const [i, m] of C.MODELLI.entries()) if (i % 5 !== 4) C.stato.coll[m.id] = { g: 1 + (i % 8), c: 10 + i * 7 };
      C.ricalcola(); C.apriVetrina(3);
    }
    C.camera();
  }, scenaFoto);
  await page.waitForTimeout(Number(process.env.ATTESA) || 6000);
  await page.screenshot({ path: path.join(OUT, nome + suff + '.png'), timeout: 120000 });
  console.log(nome + suff + '.png', errori.length ? 'ERRORI: ' + errori.join(' | ') : 'ok');
  await ctx.close();
}
await browser.close();
server.close();
