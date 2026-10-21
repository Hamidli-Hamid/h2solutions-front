import "server-only";
import { cache } from "react";

import { i18n, type Locale } from "@/i18n-config";
import { deepMerge, getContent } from "@/lib/content";

const loaders = {
  az: () => import("@/dictionaries/az.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  ru: () => import("@/dictionaries/ru.json").then((m) => m.default),
  de: () => import("@/dictionaries/de.json").then((m) => m.default),
  kk: () => import("@/dictionaries/kk.json").then((m) => m.default),
  uz: () => import("@/dictionaries/uz.json").then((m) => m.default),
} satisfies Record<Locale, () => Promise<Dictionary>>;

type Bundled = typeof import("@/dictionaries/az.json");

/**
 * Values the admin can publish that the bundled files deliberately do not ship
 * — a WhatsApp line exists only once someone enters one.
 */
type ManagedOnly = {
  contact: { whatsapp?: string };
};

export type Dictionary = Bundled & ManagedOnly;

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

/**
 * All six languages at once, for the few facts that have to read the same on
 * every page — the founder's spellings on the one `#founder` node. Cached per
 * render pass; each language's content read is shared with its own pages.
 */
export const getAllDictionaries = cache(
  async (): Promise<Dictionary[]> =>
    Promise.all(i18n.locales.map((locale) => getDictionary(locale))),
);
