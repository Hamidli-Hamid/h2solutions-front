import "server-only";
import type { Locale } from "@/i18n-config";
import { deepMerge, getContent } from "@/lib/content";

const loaders = {
  az: () => import("@/dictionaries/az.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  ru: () => import("@/dictionaries/ru.json").then((m) => m.default),
  de: () => import("@/dictionaries/de.json").then((m) => m.default),
  kk: () => import("@/dictionaries/kk.json").then((m) => m.default),
  uz: () => import("@/dictionaries/uz.json").then((m) => m.default),
} satisfies Record<Locale, () => Promise<Dictionary>>;

export type Dictionary = typeof import("@/dictionaries/az.json");

/**
 * Site copy for one language: what the admin publishes, laid over the
 * dictionary that ships with the build.
 *
 * The bundled files are the contract — they define the shape every component
 * reads and keep the site rendering when the backend is unreachable or a block
 * has not been translated yet.
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = loaders[locale] ?? loaders.az;
  const [bundled, managed] = await Promise.all([loader(), getContent(locale)]);

  if (!managed?.content) return bundled;

  return deepMerge(bundled, managed.content);
}
