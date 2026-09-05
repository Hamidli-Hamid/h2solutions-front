export const i18n = {
  defaultLocale: "az",
  locales: ["az", "en", "ru", "de", "kk", "uz"],
} as const;

export type Locale = (typeof i18n.locales)[number];

/** Endonyms — every language is listed the way its own speakers write it. */
export const localeNames: Record<Locale, string> = {
  az: "Azərbaycan",
  en: "English",
  ru: "Русский",
  de: "Deutsch",
  kk: "Қазақша",
  uz: "Oʻzbekcha",
};

export const localeShortLabels: Record<Locale, string> = {
  az: "AZ",
  en: "EN",
  ru: "RU",
  de: "DE",
  kk: "KK",
  uz: "UZ",
};

/** BCP 47 tags for Intl formatting. */
export const localeTags: Record<Locale, string> = {
  az: "az-AZ",
  en: "en-GB",
  ru: "ru-RU",
  de: "de-DE",
  kk: "kk-KZ",
  uz: "uz-UZ",
};

/** Open Graph locale identifiers (`og:locale`). */
export const ogLocales: Record<Locale, string> = {
  az: "az_AZ",
  en: "en_US",
  ru: "ru_RU",
  de: "de_DE",
  kk: "kk_KZ",
  uz: "uz_UZ",
};

export function isLocale(value: string): value is Locale {
  return (i18n.locales as readonly string[]).includes(value);
}

/**
 * A route's path in one language.
 *
 * Azerbaijani is the site's default and is served from the bare path — `/about`,
 * not `/az/about` — so the language nearly every visitor reads is not pushed one
 * segment deep, and every az URL has exactly one form. The other five keep their
 * prefix.
 *
 * `path` is the route under the prefix: "" (or "/") for the homepage, "/about",
 * "/blog/slug"… The homepage in the default language is "/", which is also what
 * the canonical tag, the sitemap and the hreflang annotations name.
 */
export function localePath(lang: Locale, path: string = ""): string {
  const route = path === "/" ? "" : path;
  return lang === i18n.defaultLocale ? route || "/" : `/${lang}${route}`;
}
