/**
 * Generates favicon.ico and apple-icon.png with initials "AF"
 * Run with: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, "../src/app");

const BG = "#1a1a1a";
const TEXT = "white";
const INITIALS = "AF";

function buildSvg(size) {
  const fontSize = Math.round(size * 0.44);
  const radius = Math.round(size * 0.22);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${BG}"/>
  <text
    x="50%" y="54%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
    font-size="${fontSize}"
    font-weight="bold"
    fill="${TEXT}"
    letter-spacing="-0.5"
  >${INITIALS}</text>
</svg>`;
}

/** Wraps a PNG buffer into a valid .ico file (ICO with PNG image inside) */
function pngToIco(pngBuffer) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: 1 = ICO
  header.writeUInt16LE(1, 4); // Image count: 1

  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // Width (0 = 256)
  entry.writeUInt8(32, 1); // Height
  entry.writeUInt8(0, 2); // ColorCount
  entry.writeUInt8(0, 3); // Reserved
  entry.writeUInt16LE(1, 4); // Planes
  entry.writeUInt16LE(32, 6); // BitCount
  entry.writeUInt32LE(pngBuffer.length, 8); // Size of image data
  entry.writeUInt32LE(22, 12); // Offset of image data (6 + 16)

  return Buffer.concat([header, entry, pngBuffer]);
}

async function main() {
  // favicon.ico (32x32)
  const svg32 = buildSvg(32);
  const png32 = await sharp(Buffer.from(svg32)).resize(32, 32).png().toBuffer();

  const icoBuffer = pngToIco(png32);
  fs.writeFileSync(path.join(appDir, "favicon.ico"), icoBuffer);
  console.log("✓ favicon.ico generated");

  // apple-icon.png (180x180)
  const svg180 = buildSvg(180);
  await sharp(Buffer.from(svg180))
    .resize(180, 180)
    .png()
    .toFile(path.join(appDir, "apple-icon.png"));
  console.log("✓ apple-icon.png generated");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
