import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "../public");
const widths = [640, 1024, 1920];

const sources = [
  { base: "close-up-dairy-products-optimized", input: "close-up-dairy-products-optimized.jpg" },
  { base: "healthy-vegetables-wooden-table-optimized", input: "healthy-vegetables-wooden-table-optimized.jpg" },
  { base: "healthy-vegetables-old-dark-background", input: "healthy-vegetables-old-dark-background.jpg" },
  { base: "top-view-tasty-fruits-arrangement-optimized", input: "top-view-tasty-fruits-arrangement-optimized.jpg" },
];

for (const { base, input } of sources) {
  const inputPath = path.join(publicDir, input);
  if (!fs.existsSync(inputPath)) {
    console.warn(`Skipping ${input} — file not found`);
    continue;
  }

  for (const width of widths) {
    const webpOut = path.join(publicDir, `${base}-${width}w.webp`);
    const jpgOut = path.join(publicDir, `${base}-${width}w.jpg`);

    await sharp(inputPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(webpOut);

    await sharp(inputPath)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(jpgOut);

    console.log(`Generated ${path.basename(webpOut)}`);
  }

  const fallbackWebp = path.join(publicDir, `${base}.webp`);
  await sharp(inputPath).webp({ quality: 82, effort: 6 }).toFile(fallbackWebp);
}

console.log("Responsive images generated.");
