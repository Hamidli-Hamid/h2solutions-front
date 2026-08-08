import type { MetadataRoute } from "next";
import { i18n, type Locale } from "@/i18n-config";
import { siteConfig } from "@/lib/site-config";
import { fetchBlogPosts, fetchProjects, fetchServices } from "@/lib/api";
import { getContent, type PageKey } from "@/lib/content";

/** Static routes and the admin page they are managed from. */
const staticPaths: Array<{ path: string; page: PageKey }> = [
  { path: "", page: "home" },
  { path: "/about", page: "about" },
  { path: "/services", page: "services" },
  { path: "/portfolio", page: "portfolio" },
  { path: "/blog", page: "blog" },
  { path: "/contact", page: "contact" },
];

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
  const locales = i18n.locales as readonly Locale[];

  /* A page or record switched to "no indexing" in the admin is left out of the
     sitemap as well, so the two never contradict each other. */
  const seoByLocale = Object.fromEntries(
    await Promise.all(
      locales.map(async (locale) => [locale, (await getContent(locale))?.seo ?? {}] as const),
    ),
  ) as Record<Locale, Record<string, { robots?: { index: boolean } }>>;

  const indexable = (locale: Locale, page: PageKey) =>
    seoByLocale[locale]?.[page]?.robots?.index !== false;

  for (const { path, page } of staticPaths) {
    for (const locale of locales) {
      if (!indexable(locale, page)) continue;

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
    locales.map((locale) => fetchServices(locale).then((data) => ({ locale, data }))),
  );

  for (const { locale, data } of servicesByLocale) {
    if (!indexable(locale, "service-detail")) continue;

    for (const service of data) {
      if (service.seo?.robots?.index === false) continue;

      entries.push({
        url: `${siteConfig.url}/${locale}/services/${service.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages: buildAlternates(`/services/${service.slug}`) },
      });
    }
  }

  const projectsByLocale = await Promise.all(
    locales.map((locale) => fetchProjects(locale).then((data) => ({ locale, data }))),
  );

  for (const { locale, data } of projectsByLocale) {
    if (!indexable(locale, "project-detail")) continue;

    for (const project of data) {
      if (project.seo?.robots?.index === false) continue;

      entries.push({
        url: `${siteConfig.url}/${locale}/portfolio/${project.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: buildAlternates(`/portfolio/${project.slug}`) },
      });
    }
  }

  const postsByLocale = await Promise.all(
    locales.map((locale) => fetchBlogPosts(locale).then((data) => ({ locale, data }))),
  );

  for (const { locale, data } of postsByLocale) {
    if (!indexable(locale, "blog-detail")) continue;

    for (const post of data) {
      if (post.seo?.robots?.index === false) continue;

      entries.push({
        url: `${siteConfig.url}/${locale}/blog/${post.slug}`,
        lastModified: post.published_at ? new Date(post.published_at) : now,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: { languages: buildAlternates(`/blog/${post.slug}`) },
      });
    }
  }

  return entries;
}
