import type { MetadataRoute } from "next";
import { i18n, type Locale } from "@/i18n-config";
import { siteConfig } from "@/lib/site-config";
import { fetchServices } from "@/lib/api";

const staticPaths = ["", "/about", "/services", "/portfolio", "/blog", "/contact"];

function buildAlternates(path: string) {
  return Object.fromEntries(
    i18n.locales.map((l) => [l, `${siteConfig.url}/${l}${path}`]),
  );
}

function priorityFor(path: string): number {
  if (path === "") return 1;
  if (path === "/services") return 0.9;
  if (path === "/contact") return 0.8;
  return 0.7;
}

function changeFrequencyFor(
  path: string,
): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (path === "") return "weekly";
  if (path === "/blog") return "weekly";
  return "monthly";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    for (const locale of i18n.locales as readonly Locale[]) {
      entries.push({
        url: `${siteConfig.url}/${locale}${path}`,
        lastModified: now,
        changeFrequency: changeFrequencyFor(path),
        priority: priorityFor(path),
        alternates: { languages: buildAlternates(path) },
      });
    }
  }

  const servicesByLocale = await Promise.all(
    (i18n.locales as readonly Locale[]).map((locale) =>
      fetchServices(locale).then((data) => ({ locale, data })),
    ),
  );

  for (const { locale, data } of servicesByLocale) {
    for (const service of data) {
      entries.push({
        url: `${siteConfig.url}/${locale}/services/${service.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: {
          languages: buildAlternates(`/services/${service.slug}`),
        },
      });
    }
  }

  return entries;
}
