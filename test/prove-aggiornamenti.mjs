// Prova del badge aggiornamenti dei giochi (Claw Machine e Coin Dozer), senza browser.
// Uso: node test/prove-aggiornamenti.mjs   (legge lo snippet dal gioco vero)
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = fs.existsSync(path.join(radice, 'gioca/index.html')) ? 'gioca/index.html' : 'index.html';
const html = fs.readFileSync(path.join(radice, file), 'utf8');
const m = html.match(/<!-- Controllo aggiornamenti[\s\S]*?<script>([\s\S]*?)<\/script>/);
if (!m) { console.log('FAIL snippet non trovato in ' + file); process.exit(1); }
let ok = true; const verifica = (n, c) => { console.log((c ? 'OK   ' : 'FAIL ') + n); if (!c) ok = false; };

function mondo({ protocollo, hostname = '', versione = 'v1.2.0' }) {
  const timers = []; let ora = 0, chiamate = 0, rete = true, ultimaUrl = '';
  const badge = { style: {}, textContent: '', title: '', onclick: null };
  const ctx = {
    location: { protocol: protocollo, hostname, href: '' },
    document: { getElementById: (id) => id === 'versione' ? { textContent: versione } : null, createElement: () => badge, body: { appendChild() {} } },
    fetch: async (u) => { chiamate++; ultimaUrl = u; if (!rete) throw new Error('offline'); return { ok: true, json: async () => ({ tag_name: 'v9.0.0', html_url: 'https://github.com/x/releases/tag/v9.0.0' }) }; },
    setTimeout: (f, ms) => { timers.push({ f, t: ora + ms }); },
    parseInt, String, Error,
  };
  vm.createContext(ctx); vm.runInContext(m[1], ctx);
  const avanza = async (ms) => { const fine = ora + ms; for (;;) { timers.sort((a, b) => a.t - b.t); const n = timers.find((x) => x.t <= fine); if (!n) break; timers.splice(timers.indexOf(n), 1); ora = n.t; n.f(); await new Promise((r) => setImmediate(r)); await new Promise((r) => setImmediate(r)); } ora = fine; };
  return { ctx, badge, avanza, n: () => chiamate, url: () => ultimaUrl, rete: (v) => { rete = v; } };
}

let w = mondo({ protocollo: 'https:', hostname: 'cammo22.github.io' });
await w.avanza(9000);
verifica('sul web (Pages) non fa niente', w.n() === 0);

w = mondo({ protocollo: 'app:' });
verifica('nell\'app: nessuna richiesta prima degli 8 secondi', w.n() === 0);
await w.avanza(8100);
verifica('all\'avvio controlla GitHub (' + w.url() + ')', w.n() === 1 && /api\.github\.com\/repos\/.+\/releases\/latest/.test(w.url()));
verifica('badge: ' + w.badge.textContent, w.badge.textContent === 'Aggiornamento 9.0.0 disponibile');
w.badge.onclick();
verifica('il clic apre la release', w.ctx.location.href.includes('/releases/tag/v9.0.0'));
await w.avanza(3.9 * 3600 * 1000);
verifica('prima delle 4 ore non richiama', w.n() === 1);
await w.avanza(0.2 * 3600 * 1000);
verifica('dopo 4 ore ricontrolla', w.n() === 2);
w.rete(false);
await w.avanza(4.1 * 3600 * 1000);
verifica('offline: nessuna eccezione', w.n() === 3);
await w.avanza(21 * 60 * 1000);
verifica('offline: riprova dopo 20 minuti', w.n() === 4);

w = mondo({ protocollo: 'app:', versione: 'v9.0.0' });
await w.avanza(8100);
verifica('stessa versione: nessun badge', w.n() === 1 && w.badge.textContent === '');
w = mondo({ protocollo: 'https:', hostname: 'appassets.androidplatform.net', versione: 'v1.0.0' });
await w.avanza(8100);
verifica('Android: controlla e mostra il badge', w.n() === 1 && w.badge.textContent !== '');
process.exit(ok ? 0 : 1);
