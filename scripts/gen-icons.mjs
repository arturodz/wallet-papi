// Rasterize public/icon.svg into the PNG icon set the PWA manifest needs.
//
//   node scripts/gen-icons.mjs
//
// Outputs (public/icons/):
//   icon-192.png        — standard "any" icon
//   icon-512.png        — standard "any" icon (large)
//   maskable-512.png    — maskable icon with safe-zone padding (~20%)
//   apple-touch-icon.png — 180x180, opaque background (iOS adds its own mask)
import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const srcPath = join(root, "public", "icon.svg");
const outDir = join(root, "public", "icons");

// Instrument-panel background, matches manifest background_color.
const BG = { r: 0x0b, g: 0x0f, b: 0x14, alpha: 1 };

async function main() {
  await mkdir(outDir, { recursive: true });
  const svg = await readFile(srcPath);

  // Standard "any" icons — transparent corners (SVG draws its own rounded panel).
  for (const size of [192, 512]) {
    await sharp(svg, { density: 384 })
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(join(outDir, `icon-${size}.png`));
  }

  // Maskable: shrink the artwork into the inner ~80% safe zone, fill the rest
  // with the panel color so platform masks (circle/squircle) never clip content.
  const maskSize = 512;
  const inner = Math.round(maskSize * 0.8); // 20% total padding
  const innerPng = await sharp(svg, { density: 384 })
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: { width: maskSize, height: maskSize, channels: 4, background: BG },
  })
    .composite([{ input: innerPng, gravity: "center" }])
    .png()
    .toFile(join(outDir, "maskable-512.png"));

  // Apple touch icon: 180x180, fully opaque background (no transparency on iOS).
  const appleSize = 180;
  const appleArt = await sharp(svg, { density: 384 })
    .resize(appleSize, appleSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: { width: appleSize, height: appleSize, channels: 4, background: BG },
  })
    .composite([{ input: appleArt, gravity: "center" }])
    .png()
    .toFile(join(outDir, "apple-touch-icon.png"));

  console.log("Icons written to public/icons/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
