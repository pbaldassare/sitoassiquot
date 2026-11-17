/**
 * Genera gli asset del brand in public/brand/ dal logo vero di ASSIQUOT.
 *
 * Sorgente: scripts/brand/assiquot-logo-source.jpg, il logo fornito dal cliente stampato su
 * alluminio spazzolato. Lo script toglie lo sfondo metallico (stima dello sfondo con sfocatura
 * larga, poi alfa per scostamento di luminosità e saturazione) e ritaglia le varianti:
 *
 * - logo-full.png: simbolo + ASSIQUOT + payoff, sfondo trasparente.
 * - logo.png: simbolo + ASSIQUOT, senza payoff (header). logo-meta.json: proporzioni per Logo.astro.
 * - mark.png: solo il simbolo (freccia, stella, $€).
 * - favicon-32.png, favicon-48.png, apple-touch-icon.png: simbolo su riquadro chiaro.
 * - og-image.png 1200×630: anteprima social.
 *
 * Solo sharp, niente browser. Uso: `npm run brand:build`
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'brand');
const SRC = path.join(__dirname, 'brand', 'assiquot-logo-source.jpg');
fs.mkdirSync(OUT, { recursive: true });

// Token (identici a src/styles/tokens.css)
const SILVER = { r: 0xee, g: 0xf0, b: 0xf3 };
const INK = [0x14, 0x17, 0x1d];

const { data, info } = await sharp(SRC).removeAlpha().median(5).raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const N = W * H;

const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const sat = (r, g, b) => Math.max(r, g, b) - Math.min(r, g, b);

// 1. Sfondo stimato: i pixel di inchiostro vengono sostituiti con la media dello sfondo, poi sfocatura larga
let sum = 0;
let cnt = 0;
const isInk = new Uint8Array(N);
for (let i = 0; i < N; i++) {
  const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
  if (sat(r, g, b) > 30 || lum(r, g, b) < 140) isInk[i] = 1;
  else {
    sum += lum(r, g, b);
    cnt++;
  }
}
const bgMean = sum / cnt;
const fill = Buffer.alloc(N);
for (let i = 0; i < N; i++) {
  fill[i] = isInk[i] ? bgMean : Math.round(lum(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]));
}
const bg = await sharp(fill, { raw: { width: W, height: H, channels: 1 } }).blur(24).raw().toBuffer();

// 2. Alfa: quanto il pixel si scosta dallo sfondo locale (scuro) o quanto è saturo (blu/rosso)
const out = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
  const L = lum(r, g, b);
  const S = sat(r, g, b);
  const aDark = Math.min(1, Math.max(0, (bg[i] - L - 55) / 60));
  const aSat = Math.min(1, Math.max(0, (S - 40) / 40));
  const a = Math.max(aDark, aSat);
  let cr = r, cg = g, cb = b;
  if (aSat < 0.5) {
    // grigi (payoff, $€): inchiostro unico, niente rilievo metallico
    [cr, cg, cb] = INK;
  } else {
    // colori: tolgo la luce del rilievo schiarendo verso il tono pieno
    const k = Math.min(1, 150 / Math.max(1, L + 40));
    cr = Math.round(r * k); cg = Math.round(g * k); cb = Math.round(b * k);
  }
  out[i * 4] = cr;
  out[i * 4 + 1] = cg;
  out[i * 4 + 2] = cb;
  out[i * 4 + 3] = Math.round(a * 255);
}
const keyed = sharp(out, { raw: { width: W, height: H, channels: 4 } });
const keyedPng = await keyed.png().toBuffer();

const write = async (name, img) => {
  await img.toFile(path.join(OUT, name));
  console.log('scritto', `public/brand/${name}`);
};
// sharp esegue trim prima di extract nella stessa pipeline: servono due passaggi
const crop = async (box) => sharp(await sharp(keyedPng).extract(box).png().toBuffer()).trim({ threshold: 1 });

// Riquadri nell'immagine sorgente (1516×704)
const FULL = { left: 50, top: 170, width: 1460, height: 345 };
const WORD = { left: 50, top: 170, width: 1460, height: 280 };
const MARK = { left: 55, top: 175, width: 300, height: 265 };

await write('logo-full.png', (await crop(FULL)).png());
const wordBuf = await (await crop(WORD)).png().toBuffer();
await write('logo.png', sharp(wordBuf).resize({ height: 160 }).png());
const wm = await sharp(wordBuf).metadata();
const markBuf = await (await crop(MARK)).png().toBuffer();
await write('mark.png', sharp(markBuf).png());

fs.writeFileSync(
  path.join(OUT, 'logo-meta.json'),
  JSON.stringify({ wordmark: { width: wm.width, height: wm.height } }, null, 2) + '\n'
);
console.log('scritto public/brand/logo-meta.json');

// Icone: simbolo su riquadro argento
const icon = async (size, name) => {
  const inner = Math.round(size * 0.82);
  const m = await sharp(markBuf).resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  await write(
    name,
    sharp({ create: { width: size, height: size, channels: 4, background: { ...SILVER, alpha: 1 } } })
      .composite([{ input: m, gravity: 'center' }])
      .png()
  );
};
await icon(32, 'favicon-32.png');
await icon(48, 'favicon-48.png');
await icon(180, 'apple-touch-icon.png');

// Anteprima social 1200×630
const full = await sharp(await (await crop(FULL)).png().toBuffer()).resize({ width: 980 }).toBuffer();
await write(
  'og-image.png',
  sharp({ create: { width: 1200, height: 630, channels: 4, background: { ...SILVER, alpha: 1 } } })
    .composite([{ input: full, gravity: 'center' }])
    .png()
);
