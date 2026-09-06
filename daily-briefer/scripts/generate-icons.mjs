/* Regenerates the PWA icons from an inline SVG in the app's own palette.
 *
 *   npm i -D sharp && npm run icons
 *
 * sharp is not a project dependency — icons change roughly never, and the
 * generated PNGs are committed. */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

const PARCHMENT = "#F2F1EC";
const TEAL = "#2B5D63";

/** A teal rounded square with the app's check mark; `bleed` fills the whole
 *  canvas for the maskable variant, which Android crops to its own shape. */
const svg = (size, bleed) => {
  const pad = bleed ? 0 : Math.round(size * 0.115);
  const box = size - pad * 2;
  const radius = bleed ? 0 : Math.round(box * 0.235);
  const c = size / 2;
  const arm = size * (bleed ? 0.16 : 0.145);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${bleed ? TEAL : PARCHMENT}"/>
  <rect x="${pad}" y="${pad}" width="${box}" height="${box}" rx="${radius}" fill="${TEAL}"/>
  <path d="M ${c - arm} ${c} L ${c - arm * 0.25} ${c + arm * 0.72} L ${c + arm} ${c - arm * 0.7}"
        fill="none" stroke="${PARCHMENT}" stroke-width="${size * 0.075}"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
};

const targets = [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["apple-touch-icon.png", 180, true],
  ["maskable-512.png", 512, true],
];

const { default: sharp } = await import("sharp").catch(() => {
  console.error("sharp is required: npm i -D sharp");
  process.exit(1);
});

await mkdir(OUT, { recursive: true });
for (const [name, size, bleed] of targets) {
  const png = await sharp(Buffer.from(svg(size, bleed))).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(resolve(OUT, name), png);
  console.log(`wrote ${name} (${size}px, ${png.length} bytes)`);
}
