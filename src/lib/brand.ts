/**
 * Built-in brand files in `public/` — the 2026-10-21 logo, vectorised from the
 * designer's PNG into `public/brand/*.svg`; every favicon and the share card are
 * rendered from those by `npm run icons`.
 *
 * The file names stay stable while Cloudflare and browsers keep them for hours,
 * so links carry a version. Bump it whenever the artwork changes.
 */
export const BRAND_VERSION = "20261021";

/** A `public/` brand path with the cache-busting version appended. */
export const brandAsset = (path: string) => `${path}?v=${BRAND_VERSION}`;

/** Intrinsic size of the horizontal lockup (`public/brand/h2-solutions-logo-*.svg`). */
export const LOGO_LOCKUP = { width: 1305, height: 303 };
