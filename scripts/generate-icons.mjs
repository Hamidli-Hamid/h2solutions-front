/**
 * Builds the favicon set and the share card from the vector brand files.
 *
 * Run after changing the mark:  npm run icons
 *
 * Sources (2026-10-21 logo, vectorised from the designer's PNG):
 *   public/brand/h2-solutions-mark.svg           the H2 mark alone
 *   public/brand/h2-solutions-logo-stacked.svg   mark over the white wordmark
 *
 * Three icon families come out of the one mark:
 *   - browser icons (favicon.svg, 16/32/48/96, .ico, Android "any"): the mark on
 *     a rounded navy tile with transparent corners
 *   - Apple touch icon: full-bleed opaque square, because iOS paints
 *     transparency black and rounds the corners itself
 *   - maskable icons: full-bleed, mark inside the central 80% safe zone that
 *     Android crops to its own shape
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const brandDir = path.join(publicDir, "brand");

/** Tile fill, top to bottom — the navy of the brand pack's icon tile. */
const TILE_TOP = "#04192e";
const TILE_BOTTOM = "#010c1b";
/** Solid colour for flattened edges, between the two gradient stops. */
const TILE_FLAT = "#030f20";

const markSvg = await readFile(path.join(brandDir, "h2-solutions-mark.svg"), "utf8");
const stackedSvg = await readFile(path.join(brandDir, "h2-solutions-logo-stacked.svg"));

const [, markW, markH] = markSvg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
const markInner = markSvg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");

/**
 * A 512-unit square with the mark centred at `share` of the width.
 * `rounded` gives the browser tile; without it the square is full-bleed.
 */
const tileSvg = ({ share, rounded }) => {
  const w = 512 * share;
  const h = (w * markH) / markW;
  const x = (512 - w) / 2;
  const y = (512 - h) / 2;
  const radius = rounded ? 112 : 0;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-label="H2 solutions">` +
    `<defs><linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${TILE_TOP}"/><stop offset="1" stop-color="${TILE_BOTTOM}"/>` +
    `</linearGradient></defs>` +
    `<rect width="512" height="512" rx="${radius}" fill="url(#tile)"/>` +
    `<svg x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" viewBox="0 0 ${markW} ${markH}">` +
    markInner +
    `</svg></svg>\n`
  );
};

const browserTile = tileSvg({ share: 0.8, rounded: true });
const appleTile = tileSvg({ share: 0.7, rounded: false });
const maskableTile = tileSvg({ share: 0.6, rounded: false });

/** Rasterise at a high density first so small sizes are downsampled, not drawn coarse. */
const render = (svg, size) =>
  sharp(Buffer.from(svg), { density: 72 * Math.max(1, (size * 4) / 512) })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();

/** Opaque render: no alpha channel at all, since iOS treats any transparency as black. */
const renderOpaque = async (svg, size) =>
  sharp(await render(svg, size))
    .flatten({ background: TILE_FLAT })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();

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
  console.log(`${name.padEnd(32)} ${(buffer.length / 1024).toFixed(1)} kB`);
};

/**
 * 1200x630 share card. The stacked logo stays inside the centre 630x630,
 * which is all older WhatsApp versions show as the thumbnail.
 */
const shareCard = async () => {
  const logoWidth = 560;
  const logo = await sharp(stackedSvg, { density: 216 }).resize(logoWidth).png().toBuffer();
  const { height: logoHeight } = await sharp(logo).metadata();

  const background =
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">` +
    `<defs>` +
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#06162b"/><stop offset="0.6" stop-color="#030e1e"/><stop offset="1" stop-color="#020a16"/></linearGradient>` +
    `<radialGradient id="cyan" cx="0.88" cy="0.1" r="0.45"><stop offset="0" stop-color="#14e8fd" stop-opacity="0.16"/><stop offset="1" stop-color="#14e8fd" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="violet" cx="0.1" cy="0.95" r="0.45"><stop offset="0" stop-color="#9986fc" stop-opacity="0.16"/><stop offset="1" stop-color="#9986fc" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="bar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#14e8fd"/><stop offset="0.55" stop-color="#4bb0fd"/><stop offset="1" stop-color="#9986fc"/></linearGradient>` +
    `</defs>` +
    `<rect width="1200" height="630" fill="url(#bg)"/>` +
    `<rect width="1200" height="630" fill="url(#cyan)"/>` +
    `<rect width="1200" height="630" fill="url(#violet)"/>` +
    `<rect y="618" width="1200" height="12" fill="url(#bar)"/>` +
    `</svg>`;

  return sharp(Buffer.from(background))
    .composite([
      {
        input: logo,
        left: Math.round((1200 - logoWidth) / 2),
        top: Math.round((630 - logoHeight) / 2),
      },
    ])
    .flatten({ background: "#030e1e" })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
};

await mkdir(path.join(publicDir, "og"), { recursive: true });

// Modern browsers: the vector tile itself.
await write("favicon.svg", Buffer.from(browserTile));

// Raster browser icons; Google Search reads the 48px one for result icons.
for (const size of [16, 32, 48, 96]) {
  await write(`favicon-${size}x${size}.png`, await render(browserTile, size));
}

// Legacy .ico (served at /favicon.ico): the three sizes Windows and old browsers pick from.
const icoEntries = await Promise.all(
  [16, 32, 48].map(async (size) => ({ size, png: await render(browserTile, size) })),
);
await write("favicon-default.ico", ico(icoEntries));

// iOS home screen.
await write("apple-touch-icon.png", await renderOpaque(appleTile, 180));

// Android home screen and PWA install prompt.
await write("android-chrome-192x192.png", await render(browserTile, 192));
await write("android-chrome-512x512.png", await render(browserTile, 512));
await write("maskable-icon-192x192.png", await renderOpaque(maskableTile, 192));
await write("maskable-icon-512x512.png", await renderOpaque(maskableTile, 512));

// Share card — a new design gets a new file name (previews are cached by URL).
await write("og/h2-solutions-card.png", await shareCard());
