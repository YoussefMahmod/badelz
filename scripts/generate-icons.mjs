import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const iconsDir = join(root, "public", "icons");

const svgContent = readFileSync(join(iconsDir, "icon.svg"), "utf8");
const svgBuffer = Buffer.from(svgContent);

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-maskable.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(iconsDir, name));
  console.log(`Generated ${name} (${size}x${size})`);
}

// Also generate favicon.ico replacement as 32x32 PNG
await sharp(svgBuffer)
  .resize(32, 32)
  .png()
  .toFile(join(root, "src", "app", "favicon.png"));
console.log("Generated favicon.png (32x32)");

console.log("Done!");
