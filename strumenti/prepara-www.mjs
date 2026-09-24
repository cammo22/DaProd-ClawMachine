// Prepara la cartella "www" delle app (Android, Windows, Mac): il gioco (gioca/index.html) con three.js
// e gli addon (bagliori, ambiente) inclusi, così le app funzionano anche senza rete.
//
//   npm i --no-save three@0.160.0
//   node strumenti/prepara-www.mjs android     -> android/app/src/main/assets/www
//   node strumenti/prepara-www.mjs desktop     -> desktop/www
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEST = { android: 'android/app/src/main/assets/www', desktop: 'desktop/www' };
const dove = process.argv[2];
if (!DEST[dove]) { console.error('uso: node strumenti/prepara-www.mjs android|desktop'); process.exit(1); }
const THREE = path.join(ROOT, 'node_modules/three');
const WWW = path.join(ROOT, DEST[dove]);
const CDN = 'https://unpkg.com/three@0.160.0/';
if (!fs.existsSync(path.join(THREE, 'build/three.module.js'))) {
  console.error('three.js non trovato: npm i --no-save three@0.160.0'); process.exit(1);
}
fs.rmSync(WWW, { recursive: true, force: true });
fs.mkdirSync(WWW, { recursive: true });
let html = fs.readFileSync(path.join(ROOT, 'gioca/index.html'), 'utf8');
if (!html.includes(CDN)) { console.error('URL della CDN non trovato in gioca/index.html'); process.exit(1); }
html = html.split(CDN).join('./three/');
fs.writeFileSync(path.join(WWW, 'index.html'), html);
for (const d of ['build/three.module.js', 'examples/jsm/postprocessing', 'examples/jsm/shaders', 'examples/jsm/environments', 'LICENSE']) {
  fs.cpSync(path.join(THREE, d), path.join(WWW, 'three', d), { recursive: true });
}
console.log('asset pronti in', path.relative(ROOT, WWW));
