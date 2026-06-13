import "server-only";
import type { Locale } from "@/i18n-config";

const loaders = {
  az: () => import("@/dictionaries/az.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  ru: () => import("@/dictionaries/ru.json").then((m) => m.default),
} satisfies Record<Locale, () => Promise<Dictionary>>;

export type Dictionary = typeof import("@/dictionaries/az.json");

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = loaders[locale] ?? loaders.az;
  return loader();
}
