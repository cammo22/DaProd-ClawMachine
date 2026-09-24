// Piccolo server per le prove: serve la pagina, il gioco e, se three.js e' installato in locale
// (node_modules/three), lo usa al posto della CDN, addon compresi: cosi' le prove girano anche senza rete.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// fileURLToPath e non .pathname: su Windows .pathname da' /C:/... e il server non trova i file.
export const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CDN = 'https://unpkg.com/three@0.160.0/';
const THREE_DIR = path.join(ROOT, 'node_modules/three');
const LOCALE = fs.existsSync(path.join(THREE_DIR, 'build/three.module.js'));
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };

export async function avviaServer(porta = 8100 + Math.floor(Math.random() * 800)) {
  const server = http.createServer((req, res) => {
    let f = decodeURIComponent(req.url.split('?')[0]);
    if (f.endsWith('/')) f += 'index.html';
    let p;
    if (f.startsWith('/three/') && LOCALE) p = path.join(THREE_DIR, f.slice(7));
    else p = path.join(ROOT, f);
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end('no'); }
    let body = fs.readFileSync(p);
    if (p.endsWith('.html') && LOCALE) body = Buffer.from(String(body).split(CDN).join('/three/'));
    res.writeHead(200, { 'content-type': TIPI[path.extname(p)] || 'application/octet-stream' });
    res.end(body);
  });
  await new Promise(r => server.listen(porta, r));
  const base = `http://127.0.0.1:${porta}/`;
  return { server, base, url: base + 'gioca/index.html', locale: LOCALE };
}
