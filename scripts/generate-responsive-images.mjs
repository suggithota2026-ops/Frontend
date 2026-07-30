import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "../public");
const sources = [
  {
    base: "close-up-dairy-products-optimized",
    input: "close-up-dairy-products-optimized.jpg",
    webpQuality: 40,
    jpegQuality: 55,
    widths: [480, 640, 1024],
    cropAspect: 0.75,
  },
  {
    base: "healthy-vegetables-wooden-table-optimized",
    input: "healthy-vegetables-wooden-table-optimized.jpg",
    webpQuality: 50,
    jpegQuality: 62,
    widths: [640, 1024],
    cropAspect: 0.7,
  },
  {
    base: "healthy-vegetables-old-dark-background",
    input: "healthy-vegetables-old-dark-background.jpg",
    webpQuality: 55,
    jpegQuality: 65,
    widths: [640, 1024],
  },
  {
    base: "top-view-tasty-fruits-arrangement-optimized",
    input: "top-view-tasty-fruits-arrangement-optimized.jpg",
    webpQuality: 32,
    jpegQuality: 58,
    widths: [480, 640, 1024],
    cropAspect: 0.45,
  },
];

for (const { base, input, webpQuality, jpegQuality, widths, cropAspect } of sources) {
  const inputPath = path.join(publicDir, input);
  if (!fs.existsSync(inputPath)) {
    console.warn(`Skipping ${input} — file not found`);
    continue;
  }

  for (const width of widths) {
    const webpOut = path.join(publicDir, `${base}-${width}w.webp`);
    const jpgOut = path.join(publicDir, `${base}-${width}w.jpg`);

    const resizeOpts = cropAspect
      ? { width, height: Math.round(width * cropAspect), fit: "cover", position: "centre" }
      : { width, withoutEnlargement: true };

    await sharp(inputPath)
      .resize(resizeOpts)
      .webp({ quality: webpQuality, effort: 6, smartSubsample: true })
      .toFile(webpOut);

    await sharp(inputPath)
      .resize(resizeOpts)
      .jpeg({ quality: jpegQuality, mozjpeg: true })
      .toFile(jpgOut);

    console.log(`Generated ${path.basename(webpOut)}`);
  }

  const fallbackWebp = path.join(publicDir, `${base}.webp`);
  const fallbackResize = cropAspect
    ? { width: 1024, height: Math.round(1024 * cropAspect), fit: "cover", position: "centre" }
    : { width: 1280, withoutEnlargement: true };
  await sharp(inputPath)
    .resize(fallbackResize)
    .webp({ quality: webpQuality, effort: 6, smartSubsample: true })
    .toFile(fallbackWebp);
}

console.log("Responsive images generated.");
