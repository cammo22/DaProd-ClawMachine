# 🦾 DaProd Claw Machine

Un **claw machine arcade 3D** giocabile direttamente nel browser: cabinato con **vetro fisico**, **pinza a 3 artigli** come quelle vere, premi con **fisica vera** (cannon-es) che piovono e si impilano, camera cinematografica, missioni, combo, XP, negozio di potenziamenti e salvataggio locale.

Nessuna build, nessuna dipendenza da installare: **un solo file `index.html`**.

## ▶️ Come giocare

**Live:** 👉 **https://cammo22.github.io/DaProd-ClawMachine/**

Oppure apri `index.html` nel browser (doppio click) e premi **GIOCA ORA**.

> Serve la connessione internet solo per scaricare Three.js da CDN (jsDelivr, con fallback automatico su unpkg).

### Controlli

| Azione | Desktop | Mobile |
|---|---|---|
| Inserisci la moneta (100₤) | Pulsante **INSERISCI MONETA** o `Invio` | Pulsante dorato **INSERISCI MONETA** |
| Muovi il braccio | Frecce / `W A S D` | Trascina il dito sul campo |
| Fai scendere il braccio | **DISCI ↓** o `Spazio` | **DISCI ↓** |
| Chiudi e tira su (risalita a pagamento) | **PRENDI ⬆** o `Spazio` | **PRENDI ⬆** |
| Riporta su vuota, **gratis** | **↺ RIALZA** o `R` | **↺ RIALZA** |
| Borsa / Negozio / Audio | 🎒 · 🛒 · 🔊 | 🎒 · 🛒 · 🔊 |

## 💰 Economia in LIRE ITALIANE ₤

Conversione reale: **1 € = 1.936,27 ₤**. Ogni importo è mostrato anche in euro (HUD, display 3D, negozio, borsa).

| Voce | Costo | Note |
|---|---|---|
| 1 partita | **100 ₤** | inserita la moneta parte il timer da **2:00** |
| 1ª risalita | **200 ₤** | |
| 2ª risalita | **500 ₤** | |
| 3ª risalita | **1.000 ₤** | 🔒 si sblocca nello shop con la **Chiave 1000₤** |

- **Massimo 2 risalite a partita** (3 con la Chiave): esaurite → **GAME OVER**. Anche il tempo scaduto è game over.
- **Le lire non si mangiano mai**: l'addebito avviene *solo* se l'azione parte davvero. Se il saldo non basta, la risalita è **gratis** con un avviso; il watchdog rimborsa automaticamente l'ultima risalita in caso di blocco; se scendi sotto 100₤ ricevi **+500₤ gratis** ogni 45s.
- **Pulsante moneta animato**: la moneta 3D vola e si infila nella fessura, che si illumina; ogni importo è convertito in euro reali.

## 🎮 Meccaniche

- **Round a tempo** — **120 secondi** (+15s per livello *Più tempo*). Il tempo scorre solo dopo aver inserito la moneta.
- **Scendi, poi scegli** (dalla v0.9) — la discesa è gratis e la pinza si **ferma sul fondo, aperta**. **PRENDI ⬆** chiude e tira su: è la risalita a pagamento (200 → 500 → 1000₤). **↺ RIALZA** la riporta su vuota **gratis**: se hai mirato male riprovi, finché c'è tempo. Senza scelta per 5 secondi rialza da sola, gratis: le lire non partono mai in automatico.
- **Mai bloccata** — ogni fase ha un'uscita propria: il trasporto sopra il buco al massimo 3 s, un premio fermo sul bordo del buco dopo 3,5 s è vinto. Il watchdog (8 s) resta solo come ultima rete.
- **Fisica vera (cannon-es)** — i premi cadono dall'alto, si impilano e rotolano; la pinza che scende li **spinge**; il premio trattenuto può **scivolare dalle dita** (le gemme ~5× più dei peluche; *Presa forte* riduce il rischio). La caduta nel buco è governata dalla fisica.
- **Pinza a 3 artigli** (dalla v0.9) — corpo centrale rosa col motore e tre artigli d'oro larghi, ognuno con due snodi, punta ricurva e gommino: si aprono, poi si chiudono *fino al premio* (l'ampiezza finale dipende dal raggio del premio). Prima erano 9 aste sottili e sembravano uno scacciapensieri.
- **Presa a probabilità** — `gripChance()` parte dal 42% (+18% sui peluche), ×0.55 sulle gemme, più difficile con campo pieno.
- **Calamita** — il premio più vicino entro il raggio di presa è il candidato (reticolo di mira sul pavimento).
- **Missioni 🎯** — obiettivi rotanti nell'HUD con ricompensa in lire.
- **Combo / streak** — prese consecutive moltiplicano il valore: bonus `1 + (streak-1) × 0.5`.
- **XP e livelli** — ogni premio dà XP (le gemme ×3); al level-up **+500₤**.
- **Cabinato sempre ricolmo** — respawn continuo, pulizia automatica dei premi finiti nel buco.

## 🥤 Bicchierone dei premi + 🎒 Borsa infinita

- **Bicchierone 3D** montato sul cabinato: ogni premio vinto ci **cade dentro**, si assesta nella pila e fa **ondeggiare gli altri** (scossone + luci). La targa 🏆 mostra il totale. Pila visibile fino a 24 pezzi (i più vecchi escono per non pesare).
- **Borsa infinita** 🎒: tutti gli item raccolti **per sempre**, con quantità, valore in lire ed euro, premi in carriera e combo record. Il totale è salvato.
- **Display LED 3D sul piano orizzontale** davanti al vetro, su un leggio inclinato verso chi gioca: saldo ₤ + euro, timer grande e risalite rimaste. L'HUD in alto è un **marquee arcade** con display LED, viti e pip delle risalite.

## 🎥 Camera dinamica

- **Tuffo intro** all'avvio del round con FOV largo (sensazione di infinito)
- **Zoom vicino** (FOV 44) sulla discesa del braccio, inseguimento del premio sul sollevamento
- **Tracking sinistra/destra veloce**, orbita morbida a riposo, punch + shake sulle vittorie

## 🏆 Premi

Il valore è in lire; con la combo il guadagno si moltiplica.

| Premio | Valore | Peso spawn | Tipo |
|---|---|---|---|
| 🧸 Orsetto | 100 ₤ | 30 | plush |
| 🐰 Coniglietto | 100 ₤ | 18 | plush |
| 🐸 Rana | 100 ₤ | 14 | plush |
| 🐧 Pinguino | 200 ₤ | 10 | plush |
| ⭐ Stella | 300 ₤ | 9 | plush |
| ❤️ Cuore | 200 ₤ | 12 | plush |
| 💎 Gemma | 500 ₤ | 8 | gemma |
| 👑 Corona | 800 ₤ | 3 | plush |
| 💠 Diamante | 1.000 ₤ | 4 | gemma |

**Modelli 3D veri, non sprite**: ogni peluche è costruito proceduralmente (capsule, sfere, orecchie, musi, arti e occhi) e **fuso in un'unica mesh indicizzata con vertex colors**; le gemme sono sfaccettate con `transmission` + IOR; stella, cuore e corona sono **estruse con bordo arrotondato**. Materiali PBR con **env map procedurale** e tone mapping **ACES**: niente effetto "plastica piatta". Pannelli del cabinet in **MeshPhysicalMaterial** con `transmission`: **vetro vero**, si vede attraverso con riflessi.

## 🛒 Negozio

Costo = `base + livello × 400 ₤`. La **Chiave 1000₤** è singola (sblocca la 3ª risalita).

| Upgrade | Effetto per livello | Costo base |
|---|---|---|
| 🦾 Presa forte | +7% probabilità di presa (max 92%) | 800 ₤ |
| ⏱️ Più tempo | +15 secondi a partita | 600 ₤ |
| 🧲 Calamita | +0.35 raggio di presa | 1.000 ₤ |
| 🍀 Fortuna | +0.4 moltiplicatore sulle gemme | 1.200 ₤ |
| 🔑 Chiave 1000₤ | sblocca la **3ª risalita** (una tantum) | 2.500 ₤ |
| 💰 Mano lesta | -10% costo delle risalite (max -50%) | 1.500 ₤ |

## 💾 Salvataggio

Progressi in `localStorage` con chiave **`daprod_claw_v2`**: lire, livello, XP, potenziamenti, stato audio, combo record, premi totali, **stato missioni** e **borsa infinita** (tutti gli item raccolti). I salvataggi della **v1 vengono migrati automaticamente** (gettoni → lire ×100). Il bonus 🎁 ricarica **+1.000 ₤** ogni 60 secondi.

## 🛠️ Stack tecnico

- **Three.js 0.160.0** + **cannon-es 0.20.0** da CDN (jsDelivr → fallback unpkg) via `import()` dinamico, senza bundler.
- **Web Audio API** per tutti gli SFX (sintetizzati a runtime, nessun file audio).
- **Canvas 2D runtime** per insegna neon, pavimento a scacchi, griglia sala, emoji dei premi, banner.
- Rendering: ombre `PCFSoftShadowMap`, luci neon orbitanti stile disco, lampade marquee HSL, campo stelle, confetti, strisce LED emissive.
- **Nessuna immagine o asset esterno**: tutto il file è autonomo.

## 📁 Struttura

```
DaProd-ClawMachine/
├── index.html        # gioco completo (HTML + CSS + JS)
├── test/prove.mjs    # prove automatiche in Chromium headless
├── README.md
└── .gitignore
```

## ✅ Prove automatiche

```
npm i --no-save playwright@1.62.0
node test/prove.mjs
```

Gioca da solo in Chromium headless: moneta, discesa, fondo, RIALZA gratis, attesa senza scelta, PRENDI a pagamento (anche a mezz'aria), fine delle risalite, tempo scaduto sul fondo. Conta le lire e misura ogni fase del braccio in **tempo di gioco** (nel rendering software i fotogrammi sono pochi e il gioco scorre più piano dell'orologio). Salva due immagini in `test/.out/`. Serve la rete: three.js e cannon-es arrivano dalla CDN.

---

Parte della serie **DaProd Games** · made by [cammo22](https://github.com/cammo22)
