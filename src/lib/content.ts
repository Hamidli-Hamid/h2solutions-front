import "server-only";
import { cache } from "react";

import { fetchContent, type ApiContent, type ApiSeo } from "@/lib/api";
import type { Locale } from "@/i18n-config";

/**
 * Page keys the admin manages. `layout` holds the site-wide defaults; the
 * `*-detail` keys are the templates behind the dynamic routes.
 */
export type PageKey =
  | "layout"
  | "home"
  | "about"
  | "services"
  | "portfolio"
  | "blog"
  | "contact"
  | "not-found"
  | "service-detail"
  | "project-detail"
  | "blog-detail";

type Json = Record<string, unknown>;

function isPlainObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Admin content laid over the bundled copy. A value the admin left empty is
 * skipped, so a half-filled block shows the shipped text rather than a gap,
 * and lists replace their counterpart outright instead of merging item by item.
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null || override === "") return base;
  if (Array.isArray(override)) return (override.length > 0 ? override : base) as T;
  if (!isPlainObject(override) || !isPlainObject(base)) return override as T;

  const merged: Json = { ...base };
  for (const [key, value] of Object.entries(override)) {
    merged[key] = deepMerge((base as Json)[key], value);
  }
  return merged as T;
}

/**
 * One request per language per render pass. Returns null when the API is
 * unreachable — every caller falls back to the bundled dictionary, so the site
 * keeps rendering if the backend is down.
 */
export const getContent = cache(
  async (locale: Locale): Promise<ApiContent | null> => fetchContent(locale),
);

/** Meta overrides an editor set for one page; empty when none were set. */
export async function getPageSeo(
  locale: Locale,
  page: PageKey,
): Promise<ApiSeo | null> {
  const content = await getContent(locale);
  const seo = content?.seo?.[page];
  return seo && Object.keys(seo).length > 0 ? seo : null;
}

/** True unless an editor switched indexing off for that page. */
export async function isIndexable(locale: Locale, page: PageKey): Promise<boolean> {
  const seo = await getPageSeo(locale, page);
  return seo?.robots?.index !== false;
}
