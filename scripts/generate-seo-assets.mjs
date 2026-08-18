/**
 * Generate favicon.png, apple-touch-icon.png, and preview.png from SVG sources.
 */
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const faviconSvg = readFileSync(join(publicDir, "favicon.svg"));
const previewSvg = readFileSync(join(publicDir, "og-preview.svg"));

await sharp(faviconSvg).resize(32, 32).png().toFile(join(publicDir, "favicon.png"));
await sharp(faviconSvg).resize(192, 192).png().toFile(join(publicDir, "favicon-192.png"));
await sharp(faviconSvg).resize(180, 180).png().toFile(join(publicDir, "apple-touch-icon.png"));
await sharp(previewSvg).resize(1200, 630).png().toFile(join(publicDir, "preview.png"));

console.log("SEO assets generated: favicon.png, favicon-192.png, apple-touch-icon.png, preview.png");
