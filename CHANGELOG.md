# Changelog DaProd Claw Machine 🦾

Tutte le versioni notevoli del gioco. Le date sono in formato AAAA-MM-GG.
Ogni versione pubblicata ha anche una [release GitHub](https://github.com/cammo22/DaProd-ClawMachine/releases)
con le app per Android, Windows e Mac, e va online su [GitHub Pages](https://cammo22.github.io/DaProd-ClawMachine/) subito dopo il push.

## [1.1.0] — 2026-09-24 · Le Lire DaProd: un portafoglio per tutti i giochi 💶

### 💶 Le Lire DaProd: un portafoglio solo per tutti i giochi DaProd
- **Le Lire DaProd** (`daprod-lira.js`): lo stesso portafoglio nella Coin Dozer, nella Claw Machine e in
  Neon Partenope. Stanno tutti su `cammo22.github.io`, quindi il browser tiene **un saldo solo**: le lire
  staccate in un gioco si spendono negli altri.
- **La partita e lo stacco**: quello che vinci nel gioco fa **punti**. Quando vuoi smettere premi **Stacca**
  e i punti diventano lire, alla **quotazione** di adesso, per la tua fetta (15%). Al massimo L.3.000 al
  giorno: il resto della partita resta per domani.
- **La Borsa della Lira**: la quotazione sale quando si spende (le ricariche) e scende quando si incassa
  (gli stacchi), con un'onda lenta uguale per tutti. Staccare adesso o aspettare è parte del gioco.
- **Ricarica** con le Lire: un gettone da L.100 ti dà **L.3.000 per le prese**.
- **Dentro la DaProd Suite** il gioco sta nella sala giochi, e il portafoglio è quello vero del computer:
  lì le cose grosse (shiny, zone nuove, prese buone) ti danno **carte** da giocare nella slot delle combinazioni.
- Il portafoglio è la barra in basso (sul telefono il tondo **₤**): toccala per vedere Borsa, fetta e tetto.

## [1.0.0] — 2026-09-23 · Il remake: la Grande Vasca dei modellini 🦾✨

Rifatto da zero, dalla fisica alla grafica all'interfaccia. Addio cabinato piccolo, blocchi e prese a vuoto misteriose.

### La Grande Vasca
- **Cinque zone una accanto all'altra** sotto un unico carroponte gigante: Peluche Park, Giocattoleria, Base Spaziale, Tana dei Mostri e Caveau dei Tesori. Ogni zona ha il suo colore, la sua insegna al neon e la sua buca.
- **Venti modellini 3D** costruiti a mano (4 per zona): orsetto, coniglietto, rana, pinguino, paperella, trottola, macchinina, dinosauro, razzo, disco volante, astronauta, pianeta, draghetto, fantasmino, slime, unicorno, corona, trofeo, gemma e il leggendario **gettone DaProd**.
- La vasca **resta sempre piena**: i modellini nuovi cadono dall'alto. Le zone si aprono con la **potenza della collezione** più un costo in lire.

### Pesca, grabba, acchiappa
- **Tre teste per il carroponte**: 🦾 la **Pinza** (ne tira su due), 🎣 l'**Amo** (uno solo, ma non lo molla quasi mai: perfetto per gli shiny) e 🥅 la **Rete** (ne acchiappa un mucchio, qualcuno scappa).
- Si tocca la vasca per spostare il carroponte e si preme **PRENDI**: il mirino mostra dove cala e quanto è largo. Il carroponte ci va da solo, cala, chiude, porta i modellini alla buca e **torna dove eri**.
- **Mai bloccato**: ogni fase ha un tempo massimo e una rete di sicurezza; la presa si paga **solo se parte davvero**; sopra la buca non si cala; con meno di L.100 arriva il **bonus di cortesia**.
- La prima presa è sempre buona; dopo tre prese a vuoto di fila la pinza si impegna di più.

### Otto gradi sempre più shiny
- Ogni modellino sale da **BASE → BRONZO → ARGENTO → ORO → OLOGRAFICO → PRISMA → DIAMANTE → COSMICO**, ognuno con un materiale suo: metallo, film iridescente, arcobaleno che scorre, scintille, galassia con le stelle.
- Si sale **raccogliendo copie** e pagando in lire, dalla **Vetrina** 3D con il modellino sul piedistallo. Ogni grado moltiplica **potenza** e **premio** (fino a ×250).
- Nella vasca cadono anche **modellini shiny**: prenderne uno lo porta subito al suo grado e vale 2, 4, 8… copie.
- **I poteri della collezione**: ogni grado dei peluche migliora la presa, dei giocattoli l'apertura, dello spazio la velocità, dei mostri la fortuna shiny e dei tesori le lire.
- La collezione rende **lire al secondo**, anche a gioco chiuso (fino a due ore, a metà rendita).

### Officina e opzioni
- Sei potenziamenti: presa forte, apertura, capienza, motore, fortuna shiny e rendita.
- Qualità alta/media/bassa, qualità automatica, contatore FPS, audio e **AZZERA TUTTO**.
- Chi arriva dalla versione 0.x trova le lire e i peluche della borsa già in vetrina.

### Sotto il cofano
- Fisica nuova scritta apposta (sfere, passo fisso 120 al secondo, griglia spaziale, sonno): niente più cannon-es.
- I modellini si disegnano con **una InstancedMesh per zona, modellino e grado**; le zone fuori inquadratura non si disegnano.
- Bagliori (bloom), mappa d'ambiente, ombre, luci colorate per zona; suoni sintetizzati in tempo reale.
- **App per Android, Windows e Mac** compilate e pubblicate da sole da GitHub Actions a ogni versione nuova.
- **Nuova home su GitHub Pages**: la macchina gioca da sola sullo sfondo e i gradi sfilano dal vivo.
- Prove automatiche riscritte da zero (`test/prove.mjs`) e foto del gioco (`test/foto.mjs`).

## [0.9.0] — 2026-09-23 · Pinza vera
- Pinza a 3 artigli con due snodi, display sul piano, RIALZA gratis, niente blocchi.

## [0.8.0] — 2026-09-23 · Economia in lire
- Economia in lire con risalite a pagamento, bicchierone dei premi, borsa infinita, watchdog.

## [0.7.0] — 2026-09-22 · Grafica e fisica
- Modelli 3D veri al posto degli emoji, gemme sfaccettate, fisica cannon-es.

## [0.3.0] — 2026-09-21 · Prima versione giocabile
- Claw machine 3D in un solo file, sala arcade, missioni.

---

Confronto tra versioni: [tags](https://github.com/cammo22/DaProd-ClawMachine/tags) ·
[releases](https://github.com/cammo22/DaProd-ClawMachine/releases)
