# DaProd · Claw Machine 🦾

[![▶ GIOCA ORA](https://img.shields.io/badge/%E2%96%B6_GIOCA_ORA-DaProd_Claw_Machine-ffd54a?style=for-the-badge&labelColor=1a1428)](https://cammo22.github.io/DaProd-ClawMachine/gioca/)

[![Home](https://img.shields.io/badge/GitHub_Pages-la_home-success?style=flat-square)](https://cammo22.github.io/DaProd-ClawMachine/)
[![Release](https://img.shields.io/github/v/release/cammo22/DaProd-ClawMachine?style=flat-square&label=release&color=ff3df2)](https://github.com/cammo22/DaProd-ClawMachine/releases/latest)
[![Changelog](https://img.shields.io/badge/📅_Changelog-mantenuto-ffab00?style=flat-square)](CHANGELOG.md)
[![Made with Three.js](https://img.shields.io/badge/Three.js-r160-black?style=flat-square&logo=three.js)](https://threejs.org/)
[![Licenza MIT](https://img.shields.io/badge/Licenza-MIT-blue?style=flat-square)](LICENSE)

La **claw machine della sala giochi DaProd**, rifatta da zero: una **Grande Vasca a cinque zone** con un
carroponte gigante. **Pesca, grabba e acchiappa** venti modellini 3D e potenziali in **otto gradi sempre
più shiny**, dal Base al Cosmico. Si gioca dal browser (telefono, tablet, computer) o con l'app per
**Android, Windows e Mac**.

## ▶ Come si gioca

1. **Tocca la vasca** (o usa frecce / `WASD`): il carroponte ci va sopra e il mirino mostra quanto è larga la presa.
2. Premi **PRENDI** (o `Spazio`): la testa cala, chiude, sale e porta quello che ha preso alla **buca** della zona.
3. Quello che cade nella buca è tuo: entra nella **Vetrina** e ti dà le lire del suo premio.
4. Con le **copie** e le lire **potenzi** ogni modellino al grado successivo: più shiny, più potente, più lire.

| Azione | Desktop | Telefono |
| --- | --- | --- |
| Sposta il carroponte | clic sulla vasca, frecce / `WASD` | tocca o trascina sulla vasca |
| Cala la testa | **PRENDI**, `Spazio` / `Invio` | **PRENDI** |
| Cambia testa | barra in basso, tasti `1` `2` `3` | barra in basso |
| Cambia zona | frecce ◀ ▶ in alto, `Q` / `E` | frecce ◀ ▶ |
| Vetrina / Officina / audio | `V` / `O` / `M` | 🏆 / 🔧 / 🔊 |
| Zoom | rotella | due dita |

### 🦾 🎣 🥅 Tre teste

| | Testa | Verbo | Cosa fa | Costo presa |
| --- | --- | --- | --- | --- |
| 🦾 | Pinza | **GRABBA** | tre artigli, fino a 2 modellini | ×1 |
| 🎣 | Amo | **PESCA** | uno solo, il più vicino, e non lo molla quasi mai: per gli shiny | ×0,8 |
| 🥅 | Rete | **ACCHIAPPA** | anello largo col sacco, fino a 5 (e più con la Capienza) | ×1,5 |

### ✨ Otto gradi

**BASE ×1 → BRONZO ×2,2 → ARGENTO ×5 → ORO ×11 → OLOGRAFICO ×24 → PRISMA ×52 → DIAMANTE ×115 → COSMICO ×250**

Ogni grado ha un materiale suo (metallo, film iridescente, arcobaleno che scorre, scintille, galassia)
e moltiplica **potenza** e **premio**. Si sale con le copie (1, 3, 7, 15, 30, 60, 120, 250 in tutto) più
le lire. Nella vasca cadono anche **modellini shiny**: preso uno ORO, il modellino sale subito al grado 4.

### 🗺️ Cinque zone

| Zona | Modellini | Presa | Potere della famiglia | Si apre con |
| --- | --- | --- | --- | --- |
| 🧸 Peluche Park | orsetto, coniglietto, rana, pinguino | L.100 | 💪 presa | — |
| 🦆 Giocattoleria | paperella, trottola, macchinina, dinosauro | L.400 | 📐 apertura | ⚡12 + L.3.000 |
| 🚀 Base Spaziale | razzo, disco volante, astronauta, pianeta | L.1.500 | ⚡ velocità | ⚡90 + L.40.000 |
| 🐉 Tana dei Mostri | draghetto, fantasmino, slime, unicorno | L.5.000 | 🍀 shiny | ⚡600 + L.350.000 |
| 👑 Caveau dei Tesori | corona, trofeo, gemma, gettone DaProd | L.18.000 | 💰 lire | ⚡4.000 + L.3 milioni |

La **potenza** è la somma dei modellini in vetrina (base × grado) e fa anche **rendita**: lire al
secondo, pure a gioco chiuso (fino a due ore, a metà). Nell'**Officina** ci sono presa forte, apertura,
capienza, motore, fortuna shiny e rendita, più le teste da sbloccare.

**Mai bloccato**: ogni fase del carroponte ha un tempo massimo, la presa si paga solo se parte davvero,
sopra la buca non si cala, e con meno di L.100 arriva il **bonus di cortesia**.

## 💶 Le Lire DaProd

Da questa versione il gioco ha **lo stesso portafoglio degli altri giochi DaProd** —
[Coin Dozer](https://cammo22.github.io/daprod-coin-dozer/), [Claw Machine](https://cammo22.github.io/DaProd-ClawMachine/gioca/)
e [Neon Partenope](https://cammo22.github.io/daprod-neon-partenope/). Stanno tutti su `cammo22.github.io`, quindi il
browser tiene **un saldo solo**.

- Quello che vinci fa **punti della partita**. Quando vuoi smettere premi **Stacca**: i punti diventano **Lire DaProd**
  alla quotazione di adesso, per la tua fetta (15%), fino a L.3.000 al giorno.
- **La Borsa della Lira**: la quotazione sale quando si spende e scende quando si incassa, con un'onda lenta uguale
  per tutti. Staccare subito o aspettare è parte del gioco.
- Con le Lire si **ricarica** (L.100 → L.3.000 per le prese).
- Dentro la [DaProd Suite](https://github.com/cammo22/DaProdSuite) il gioco sta nella **sala giochi**: lì il
  portafoglio è quello del computer, e le cose grosse danno **carte** per la slot delle combinazioni.

Il codice è `daprod-lira.js`, lo stesso file in tutti e quattro i posti (la copia buona sta nella suite).

## 💾 Salvataggio

Tutto si salva da solo in `localStorage` (chiave `daprod_claw_v3`), **mucchio della vasca compreso**. Chi
arriva dalla vecchia versione 0.x trova le lire e i peluche della borsa già in vetrina. In Officina,
scheda ⚙️ **OPZIONI**, c'è **AZZERA TUTTO**.

## 🌐 La home su GitHub Pages

[`index.html`](index.html) è la home del gioco: la macchina **gioca da sola sullo sfondo**
(`gioca/?demo`), i gradi **sfilano dal vivo** (`gioca/?vetrina`), i pulsanti di download puntano
all'ultima release e le novità si leggono dal [CHANGELOG](CHANGELOG.md). Pages pubblica il ramo `main`:
**ogni merge aggiorna la home e il gioco**.

## 📥 App per Android, Windows e Mac

Ogni [release](https://github.com/cammo22/DaProd-ClawMachine/releases/latest) ha tre file:

| | File | Come si installa |
| --- | --- | --- |
| 🤖 Android | `DaProd-Claw-Machine-X.Y.Z.apk` | aprilo sul telefono e consenti l'installazione da origini sconosciute |
| 🪟 Windows | `DaProd-Claw-Machine-X.Y.Z.exe` | portatile: doppio clic e si gioca (se SmartScreen avvisa: *Ulteriori informazioni → Esegui comunque*) |
| 🍎 Mac | `DaProd-Claw-Machine-X.Y.Z.dmg` | trascina l'app in Applicazioni; la prima volta *tasto destro → Apri* |

Le app contengono il gioco e three.js, quindi **funzionano anche offline**. EXE e DMG non sono firmati.

**È tutto automatico** (`.github/workflows/app.yml`): quando su `main` arriva una versione nuova (la
costante `VERSIONE` in `gioca/index.html`), GitHub Actions fa girare le prove, compila APK, EXE e DMG e
pubblica da solo la release `vX.Y.Z` con le note prese dal CHANGELOG. Su ogni PR fa le prove e compila
le app come controllo. Per una versione nuova basta alzare `VERSIONE`, scrivere la voce nel CHANGELOG e unire.

- `android/`: WebView a tutto schermo che serve il gioco dagli asset.
- `desktop/`: Electron, serve il gioco dal protocollo `app://` (F11 = schermo intero).
- `strumenti/prepara-www.mjs android|desktop`: copia il gioco e three.js nella cartella dell'app.

Per firmare l'APK sempre con la stessa chiave aggiungi ai segreti del repository `ANDROID_KEYSTORE_BASE64`,
`ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` e `ANDROID_KEY_PASSWORD` (senza, chiave di debug).

## 🛠 Come è fatto

Il gioco è **un solo file** ([`gioca/index.html`](gioca/index.html)) con Three.js r160 da CDN: niente build.
I modellini sono costruiti a codice (sfere, capsule, tori, forme estruse) e fusi in una geometria con i
colori per vertice; i gradi sono materiali PBR con uno shader aggiunto (tinta metallica, arcobaleno,
stelle, scintille, bordo luminoso). Si disegnano con **una InstancedMesh per zona, modellino e grado**.
La fisica è scritta apposta: sfere a passo fisso (120 al secondo), griglia spaziale e sonno.

```bash
python -m http.server 8080     # poi apri http://localhost:8080
```

### ✅ Controlli automatici

```bash
npm i --no-save playwright three@0.160.0
npx playwright install chromium
node test/prove.mjs              # oltre 100 prove: presa, fasi, teste, gradi, zone, fisica, salvataggi, home
node test/foto.mjs vasca         # foto (computer e telefono) in test/.out/: vasca, presa, shiny, vetrina, home…
```

---

**DaProd — Sala Giochi** 🕹️ · sviluppato con Three.js · rilasciato con licenza MIT · prova anche il
[Coin Dozer 🪙](https://cammo22.github.io/daprod-coin-dozer/)
