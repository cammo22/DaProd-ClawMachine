# 🦾 DaProd Claw Machine

Un **claw machine arcade 3D** giocabile direttamente nel browser: cabinato con **vetro fisico**, braccio meccanico a **9 braccetti articolati** **animato dinamicamente**, premi con **fisica vera** (cannon-es) che piovono e si impilano, camera cinematografica, missioni, combo, XP, negozio di potenziamenti e salvataggio locale.

Nessuna build, nessuna dipendenza da installare: **un solo file `index.html`**.

## ▶️ Come giocare

**Live:** 👉 **https://cammo22.github.io/DaProd-ClawMachine/**

Oppure apri `index.html` nel browser (doppio click) e premi **GIOCA ORA**.

> Serve la connessione internet solo per scaricare Three.js da CDN (jsDelivr, con fallback automatico su unpkg).

### Pubblicazione GitHub Pages

Il workflow di GitHub Pages pubblica esclusivamente dal branch `main`, perché GitHub
rifiuta i deployment Pages avviati da branch feature. Il flusso è quindi:

1. Sviluppa e verifica le modifiche sul branch di lavoro.
2. Fai merge della pull request in `main`.
3. Il push su `main` avvia automaticamente il workflow `Deploy arcade to GitHub Pages`.

Un avvio manuale del workflow da un branch diverso da `main` viene saltato
intenzionalmente e non pubblica una preview.

### Controlli

| Azione | Desktop | Mobile |
|---|---|---|
| Muovi il braccio | Frecce / `W A S D` | Trascina il dito sul campo |
| Discendi e afferra | `Spazio` / `Invio` oppure il grande **tasto rosso** | Grande **tasto rosso** |

## 🎮 Meccaniche

- **Round a tempo** — 25 secondi base (+5/livello *Più tempo*); il primo tocco del tasto rosso avvia il round.
- **Fisica vera (cannon-es)** — i premi cadono dall'alto, si impilano e rotolano; la pinza che scende li **spinge**; il premio trattenuto può **scivolare dalle dita** (le gemme scivolano ~5× più dei peluche; *Presa forte* riduce il rischio). La caduta nel buco è governata dalla fisica.
- **Presa a probabilità** — `gripChance()` parte dal 42% (+18% sui peluche), ×0.55 sulle gemme, più difficile con campo pieno.
- **Calamita** — il premio più vicino entro il raggio di presa è il candidato; il raggio cresce con l'upgrade (reticolo di mira sul pavimento).
- **Missioni 🎯** — obiettivi rotanti nell'HUD (3 peluche, 2 gemme, combo x3, 2 orsetti…) con ricompensa.
- **Combo / streak** — prese consecutive moltiplicano i gettoni: bonus `1 + (streak-1) × 0.5`.
- **XP e livelli** — ogni premio dà XP (le gemme ×3); al level-up si ricevono **+5 gettoni**.
- **Cabinato sempre ricolmo** — 55 premi a caricamento, refill a 50 a ogni round, respawn continuo sotto 45.

## 🎥 Camera dinamica

- **Tuffo intro** all'avvio del round con FOV largo (sensazione di infinito)
- **Zoom vicino** (FOV 44) sulla discesa del braccio, inseguimento del premio sul sollevamento
- **Tracking sinistra/destra veloce**, orbita morbida a riposo, punch + shake sulle vittorie

## 🏆 Premi

| Premio | Valore | Peso spawn | Tipo |
|---|---|---|---|
| 🧸 Orsetto | 1 | 30 | plush |
| 🐰 Coniglietto | 1 | 18 | plush |
| 🐸 Rana | 1 | 14 | plush |
| 🐧 Pinguino | 2 | 10 | plush |
| 💎 Gemma | 5 | 8 | gemma |
| 💠 Diamante | 10 | 4 | gemma |

I plush sono **sprite emoji** grandi e sempre inquadrati; le gemme sono ottaedri emissivi. Pannelli del cabinet in **MeshPhysicalMaterial** con `transmission` + IOR + clearcoat: **vetro vero**, si vede attraverso con riflessi. Sala arcade di sfondo con cabinati fantasma, tubi neon a soffitto, griglia al neon, polvere sospesa e banner *DaProd ARCADE*.

## 🛒 Negozio

4 potenziamenti, 5 livelli ciascuno. Costo = `base + livello × 4`.

| Upgrade | Effetto per livello | Costo base |
|---|---|---|
| 🦾 Presa forte | +7% probabilità di presa (max 92%) | 8 |
| ⏱️ Più tempo | +5 secondi a partita | 6 |
| 🧲 Calamita | +0.35 raggio di presa | 10 |
| 🍀 Fortuna | +0.4 moltiplicatore sulle gemme | 12 |

## 💾 Salvataggio

Progressi salvati in `localStorage` con chiave **`daprod_claw_v1`**: gettoni, livello, XP, potenziamenti, stato audio, combo record, premi totali e **stato missioni**. Il bonus 🎁 ricarica **+10 gettoni** ogni 60 secondi.

## 🛠️ Stack tecnico

- **Three.js 0.160.0** + **cannon-es 0.20.0** da CDN (jsDelivr → fallback unpkg) via `import()` dinamico, senza bundler.
- **Web Audio API** per tutti gli SFX (sintetizzati a runtime, nessun file audio).
- **Canvas 2D runtime** per insegna neon, pavimento a scacchi, griglia sala, emoji dei premi, banner.
- Rendering: ombre `PCFSoftShadowMap`, luci neon orbitanti stile disco, lampade marquee HSL, campo stelle, confetti, strisce LED emissive.
- **Nessuna immagine o asset esterno**: tutto il file è autonomo.

## 📁 Struttura

```
DaProd-ClawMachine/
├── index.html    # gioco completo (HTML + CSS + JS)
├── tests/        # test Node degli invarianti del ciclo partita
├── package.json  # runner test nativo Node
├── README.md
└── .gitignore
```

---

Parte della serie **DaProd Games** · made by [cammo22](https://github.com/cammo22)
