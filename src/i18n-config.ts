export const i18n = {
  defaultLocale: "az",
  locales: ["az", "en", "ru"],
} as const;

export type Locale = (typeof i18n.locales)[number];

export const localeNames: Record<Locale, string> = {
  az: "Azərbaycan",
  en: "English",
  ru: "Русский",
};

export const localeShortLabels: Record<Locale, string> = {
  az: "AZ",
  en: "EN",
  ru: "RU",
};

export function isLocale(value: string): value is Locale {
  return (i18n.locales as readonly string[]).includes(value);
}
