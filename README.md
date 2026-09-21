# 🦾 DaProd Claw Machine

Un **claw machine arcade 3D** giocabile direttamente nel browser: cabinato in Three.js, braccio meccanico a 3 dita, premi da afferrare, combo, XP, negozio di potenziamenti e salvataggio locale.

Nessuna build, nessuna dipendenza da installare: **un solo file `index.html`**.

## ▶️ Come giocare

**Live:** 👉 **https://cammo22.github.io/DaProd-ClawMachine/**

Oppure apri `index.html` nel browser (doppio click) e premi **GIOCA ORA**.

> Serve la connessione internet solo per scaricare Three.js da CDN (jsDelivr, con fallback automatico su unpkg).

### Controlli

| Azione | Desktop | Mobile |
|---|---|---|
| Muovi il braccio | Frecce / `W A S D` | Trascina il dito sul campo |
| Discendi e afferra | `Spazio` / `Invio` oppure il grande **tasto rosso** | Grande **tasto rosso** |

## 🎮 Meccaniche

- **Round a tempo** — 25 secondi base per partita, ogni tentativo di presa consuma il round.
- **Presa a probabilità** — `gripChance()` parte dal 42% e sale con l'upgrade *Presa forte*; le **gemme** hanno 0.55× di probabilità, e la presa è più difficile quando il campo è pieno di premi.
- **Calamita** — il premio più vicino entro il raggio di presa è il candidato; il raggio cresce con l'upgrade.
- **Combo / streak** — prese consecutive moltiplicano i gettoni: bonus `1 + (streak-1) × 0.5`.
- **XP e livelli** — ogni premio dà XP (le gemme ×3); al level-up si ricevono **+5 gettoni**.
- **Rigenerazione campo** — quando restano meno di 8 premi, ne ricompare uno nuovo.

## 🏆 Premi

| Premio | Valore | Peso spawn | Tipo |
|---|---|---|---|
| 🧸 Orsetto | 1 | 30 | plush |
| 🐰 Coniglietto | 1 | 18 | plush |
| 🐸 Rana | 1 | 14 | plush |
| 🐧 Pinguino | 2 | 10 | plush |
| 💎 Gemma | 5 | 8 | gemma |
| 💠 Diamante | 10 | 4 | gemma |

I plush hanno **facce disegnate a runtime** su canvas (occhi + sorriso, tinta dal colore del premio); le gemme sono ottaedri emissivi.

## 🛒 Negozio

4 potenziamenti, 5 livelli ciascuno. Costo = `base + livello × 4`.

| Upgrade | Effetto per livello | Costo base |
|---|---|---|
| 🦾 Presa forte | +7% probabilità di presa (max 92%) | 8 |
| ⏱️ Più tempo | +5 secondi a partita | 6 |
| 🧲 Calamita | +0.35 raggio di presa | 10 |
| 🍀 Fortuna | +0.4 moltiplicatore sulle gemme | 12 |

## 💾 Salvataggio

Progressi salvati in `localStorage` con chiave **`daprod_claw_v1`**: gettoni, livello, XP, potenziamenti, stato audio, combo record e premi totali. Il bonus 🎁 ricarica **+10 gettoni** ogni 60 secondi.

## 🛠️ Stack tecnico

- **Three.js 0.160.0** da CDN (jsDelivr → fallback unpkg) via `import()` dinamico, senza bundler.
- **Web Audio API** per tutti gli SFX (sintetizzati a runtime, nessun file audio).
- **Canvas 2D runtime** per texture di insegna neon, pavimento a scacchi e facce dei plush.
- Rendering: ombre `PCFSoftShadowMap`, luci neon orbitanti stile disco, campo stelle, strisce LED emissive.
- **Nessuna immagine o asset esterno**: tutto il file è autonomo.

## 📁 Struttura

```
DaProd-ClawMachine/
└── index.html    # gioco completo (HTML + CSS + JS)
```

---

Parte della serie **DaProd Games** · made by [cammo22](https://github.com/cammo22)
