# ASSIQUOT — sito vetrina

Sito statico costruito con [Astro](https://astro.build) 7 e Tailwind CSS 4, pensato per il deploy su **Cloudflare Pages**.
Il modulo di contatto è gestito da una Pages Function (`functions/api/contact.ts`) che invia email con Resend
e, se configurato, salva una copia in Cloudflare KV.

## Comandi

| Comando | Cosa fa |
| --- | --- |
| `npm install` | installa le dipendenze |
| `npm run dev` | server di sviluppo su `http://localhost:4321` (solo il sito, senza la function) |
| `npm run build` | build statica in `dist/` |
| `npm run preview` | anteprima della build |
| `npm run pages:dev` | build + `wrangler pages dev dist`: sito **e** function `/api/contact` in locale |
| `npm run brand:build` | rigenera logo, favicon, icone e anteprima social in `public/brand/` dal logo vero (`scripts/brand/assiquot-logo-source.jpg`) |
| `npm run screenshots` | screenshot desktop/mobile di ogni sezione in `docs/screenshots/` |
| `npm run check` | controllo tipi Astro/TypeScript |

Richiede Node 20 o superiore.

## Struttura

```
src/
  content/site.it.json   ← TUTTI i testi del sito (vedi "Dove cambiare i testi")
  components/            ← una sezione = un componente (Hero, Audience, Features, Rates, Collab, Contact, CookieBanner, …)
  layouts/Base.astro     ← head, SEO, Open Graph, JSON-LD, header/footer, animazioni di entrata
  pages/                 ← index, privacy, grazie, 404
  styles/tokens.css      ← design token (@theme): colori, tipografia, spaziature
  styles/global.css      ← base, componenti (.btn, .card, .field…), motion
public/
  brand/                 ← logo, favicon, OG image (generati da scripts/build-brand.mjs)
  robots.txt, _headers   ← SEO e header di sicurezza/cache per Cloudflare
functions/api/contact.ts ← Pages Function del modulo di contatto
docs/
  brand-guidelines.md    ← voce, palette, tipografia, regole del logo
  screenshots/           ← output di `npm run screenshots`
scripts/                 ← build-brand.mjs (logo trasparente dal file del cliente), screenshots.mjs
```

## Deploy su Cloudflare Pages

1. Collega il repository a Cloudflare Pages (**Workers & Pages → Create → Pages → Connect to Git**).
2. Impostazioni di build:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: 20 o superiore (variabile `NODE_VERSION=20` se serve)
3. Le Pages Functions in `functions/` vengono pubblicate automaticamente insieme al sito.
4. Aggiungi le variabili d'ambiente (sotto) in **Settings → Environment variables**, per Production e Preview.
5. Dopo il primo deploy, imposta il dominio in **Custom domains** e aggiorna `site` in `astro.config.mjs`
   (serve per sitemap, canonical e Open Graph) e l'URL della sitemap in `public/robots.txt`.

### Variabili d'ambiente

| Variabile | Obbligatoria | Descrizione |
| --- | --- | --- |
| `RESEND_API_KEY` | sì (per l'invio email) | chiave API di [Resend](https://resend.com) |
| `CONTACT_TO` | sì | destinatario delle richieste; più indirizzi separati da virgola |
| `CONTACT_FROM` | consigliata | mittente: `ASSIQUOT <info@assiquot.it>`; il dominio va verificato su Resend. Se assente usa `onboarding@resend.dev` (solo per test) |
| `KV_CONTACTS` | no | **binding KV** (Settings → Functions → KV namespace bindings). Se presente, ogni richiesta viene salvata anche in KV: funziona da fallback se Resend non è configurato o fallisce |

Se né Resend né KV sono configurati, la function risponde con errore e il sito mostra il messaggio di errore inline.

### Test locale della function

```sh
cp .dev.vars.example .dev.vars   # inserisci la tua chiave Resend
npm run build
npm run pages:dev                # http://localhost:8788
```

Per provare anche il fallback KV in locale aggiungi `--kv KV_CONTACTS` al comando `pages:dev` (KV simulato in memoria).

## Dove cambiare i testi

Tutti i testi sono in **`src/content/site.it.json`**, divisi per sezione (`hero`, `audience`, `problem`, `features`,
`rates`, `collab`, `onboarding`, `faq`, `contact`, `footer`, `cookies`, `privacy`, `thanks`). I componenti leggono da lì.

- Compagnie: `rates.base`, `rates.convention` e `rates.vehicles` (`[auto, moto, autocarri, scatola nera]`; `null` = da verificare).
  Nastro dell'hero, listino filtrabile, FAQ e `/llms.txt` si aggiornano da soli; il numero "22" nel titolo dell'hero e nei testi va cambiato a mano.
- Tabellone dell'hero: `hero.board` (premi e quote **illustrativi**, la didascalia lo dice).
- Funzionalità: `features.blocks`, quattro aree mostrate a schede.

## Dati societari

Titolare del sito e del trattamento: **Assisoft S.r.l.**, Via Trieste 22, 98071 Capo d'Orlando (ME), C.F. e Registro Imprese
di Messina 03854460833, REA ME-265022, PEC assisoftsrl@pec.it (`footer.company`, `organization`, `privacy.sections`).

Da confermare: l'email `info@assiquot.it` (segnaposto) e il dominio `assiquot.it` in `astro.config.mjs` e `public/robots.txt`.

## Privacy e cookie

- Il sito non usa cookie di profilazione né tracker. Il banner (`CookieBanner.astro`) chiede il consenso alle statistiche,
  con **Accetta** e **Rifiuta** dello stesso peso e **Personalizza**; la scelta resta in `localStorage` (`aq-consent`, 6 mesi)
  e si riapre da "Preferenze cookie" nel footer e nella privacy.
- Per attivare statistiche in futuro, caricale solo dopo il consenso: ascolta l'evento `aq:consent` (`event.detail.stats`)
  o leggi `window.aqConsent`.
- Font self-hosted (`@fontsource-variable/schibsted-grotesk` per i titoli, `@fontsource-variable/archivo` per il testo): nessuna connessione a Google.

## Brand

Regole in `docs/brand-guidelines.md`. Il logo è il file del cliente (`scripts/brand/assiquot-logo-source.jpg`, stampato su
alluminio); `npm run brand:build` toglie lo sfondo metallico e genera `logo.png`, `logo-full.png`, `mark.png`, favicon e
anteprima social. Il logo va usato solo su fondi chiari.
