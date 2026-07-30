import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public/fonts");

const copies = [
  ["node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2", "inter-400.woff2"],
  ["node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2", "inter-500.woff2"],
  ["node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", "inter-600.woff2"],
  ["node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2", "poppins-600.woff2"],
  ["node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff2", "poppins-700.woff2"],
  ["node_modules/@fontsource/poppins/files/poppins-latin-800-normal.woff2", "poppins-800.woff2"],
];

fs.mkdirSync(outDir, { recursive: true });

for (const [fromRel, destName] of copies) {
  const from = path.join(root, fromRel);
  const to = path.join(outDir, destName);
  if (!fs.existsSync(from)) {
    console.warn(`Missing font file: ${fromRel}`);
    continue;
  }
  fs.copyFileSync(from, to);
  console.log(`Copied ${destName}`);
}

console.log("Fonts copied to public/fonts.");
