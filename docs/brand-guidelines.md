# ASSIQUOT — Brand guidelines

Fonte di verità per voce, colori, tipografia e componenti del sito. I valori sono in `src/styles/tokens.css`.

## 1. A chi parla

ASSIQUOT è la piattaforma degli **intermediari assicurativi**: agenti e broker (sezioni A e B del RUI) e i loro
collaboratori (sezione E). Il sito parla il loro lavoro: mandato, portali, credenziali, emissione, incassi, provvigioni,
quote maturate, rete, convenzioni.

## 2. Voce

- Da collega a collega, **dai del tu**. Frasi corte, un'idea per frase.
- Ogni affermazione è una cosa che la piattaforma fa oggi. Niente clienti, numeri o testimonianze inventati.
  Gli esempi (premi nel tabellone) sono sempre dichiarati illustrativi.
- Vietati: "rivoluzionario", "all-in-one", "soluzione innovativa", "leader", "smart".

## 3. Mondo visivo: il listino delle quotazioni

Il logo parla di quotazioni (freccia che sale, $€, %). Il sito ne prende il linguaggio: un tabellone che quota, un nastro
di compagnie come un listino di borsa, una tabella-listino filtrabile, la freccia in su come segno degli elenchi.
Fondo argento come l'alluminio su cui è stampato il logo; il blu del logo occupa intere sezioni; il cremisi è riservato
all'azione principale e alle evidenze.

| Token | Hex | Uso |
| --- | --- | --- |
| `navy-800` | #04376E | blu del logo: titoli, link, controlli attivi |
| `navy-900` / `navy-950` | #05264A / #031A33 | sezioni piene, tabellone |
| `crimson-700` | #86122D | cremisi del logo: CTA, evidenze |
| `crimson-300` | #F0A3B4 | cremisi leggibile su blu |
| `silver` / `silver-200` | #EEF0F3 / #E2E6EC | fondo pagina e fasce |
| `ink` / `steel` | #14171D / #545C69 | testo principale e secondario |

## 4. Tipografia

**Archivo** variabile (self-hosted). Titoli in Archivo **largo** (`font-stretch: 125%`, peso 800): ricorda le lettere
larghe e squadrate del logo. Testo in Archivo normale. Numeri in cifre tabellari (`.num`).

## 5. Logo

File del cliente, scontornato da `scripts/build-brand.mjs`. Solo su fondi chiari (argento o bianco): su blu il "QUOT"
perde contrasto. Header: `logo.png` (senza payoff). Footer e anteprima social: `logo-full.png`. Non ricolorare, non
aggiungere ombre.

## 6. Componenti

- Bottoni squadrati (raggio 8px): primario cremisi, secondario a filo blu. Su blu: bianco.
- Card con raggio 14px, una sola ombra (`shadow-lift`) per tabellone e form.
- Niente etichette sopra i titoli, niente gradienti, niente glassmorphism.
