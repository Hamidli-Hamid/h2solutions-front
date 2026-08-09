/**
 * Builds the whole built-in favicon set from `public/favicon.svg`.
 *
 * Run after changing the mark:  npm run icons
 *
 * Two families come out of the same drawing:
 *   - browser icons keep the vector's transparent corners (16/32/48 + .ico)
 *   - Apple and Android icons are flattened onto an opaque square, because iOS
 *     paints transparency black and rounds the corners itself.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const source = readFileSync(path.join(publicDir, "favicon.svg"));

/** Matches the tile fill in favicon.svg, so the flattened edge is invisible. */
const BACKGROUND = "#0b111d";

/** Render the vector at `size`, keeping its own transparency. */
const render = (size) =>
  sharp(source, { density: 1200 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

/**
 * Render onto an opaque square. `inset` is the share of the canvas left as
 * padding around the mark — Android maskable icons need the outer 20% free.
 */
const renderOpaque = async (size, inset = 0) => {
  const mark = Math.round(size * (1 - inset * 2));
  const overlay = await render(mark);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([{ input: overlay, top: Math.round((size - mark) / 2), left: Math.round((size - mark) / 2) }])
    .flatten({ background: BACKGROUND })
    // No alpha channel at all: iOS treats any transparency as black.
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
};

/** ICO container holding PNG entries — what legacy Windows browsers read. */
const ico = (entries) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  let offset = 6 + 16 * entries.length;
  const directory = entries.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 means 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette colours
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...directory, ...entries.map((e) => e.png)]);
};

const write = async (name, buffer) => {
  await writeFile(path.join(publicDir, name), buffer);
  console.log(`${name.padEnd(28)} ${(buffer.length / 1024).toFixed(1)} kB`);
};

await mkdir(publicDir, { recursive: true });

// Browser icons.
for (const size of [16, 32, 48]) {
  await write(`favicon-${size}x${size}.png`, await render(size));
}

// Legacy .ico: the three sizes Windows and old browsers pick from.
const icoEntries = await Promise.all(
  [16, 32, 48].map(async (size) => ({ size, png: await render(size) })),
);
await write("favicon-default.ico", ico(icoEntries));

// iOS home screen: opaque, square corners (iOS rounds them itself).
await write("apple-touch-icon.png", await renderOpaque(180));

// Android home screen and PWA install prompt.
await write("android-chrome-192x192.png", await renderOpaque(192));
await write("android-chrome-512x512.png", await renderOpaque(512));

// Maskable variant: the mark sits inside the 80% safe zone Android crops to.
await write("android-chrome-maskable-512x512.png", await renderOpaque(512, 0.19));
