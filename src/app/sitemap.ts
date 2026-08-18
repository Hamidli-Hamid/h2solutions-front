import type { MetadataRoute } from "next";
import { i18n, type Locale } from "@/i18n-config";
import { siteConfig } from "@/lib/site-config";
import {
  fetchBlogPosts,
  fetchProjects,
  fetchServices,
  type ApiBlogPost,
  type ApiProject,
  type ApiService,
} from "@/lib/api";
import { getContent, type PageKey } from "@/lib/content";
import { resolveProjectVideo } from "@/lib/video";

type Entry = MetadataRoute.Sitemap[number];

/** Static routes and the admin page they are managed from. */
const staticPaths: Array<{ path: string; page: PageKey }> = [
  { path: "", page: "home" },
  { path: "/about", page: "about" },
  { path: "/services", page: "services" },
  { path: "/portfolio", page: "portfolio" },
  { path: "/blog", page: "blog" },
  { path: "/contact", page: "contact" },
];

/**
 * Next writes sitemap values into the XML verbatim — see
 * `next/dist/build/webpack/loaders/metadata/resolve-route-data.js`, which
 * interpolates `<loc>`, `<image:loc>` and every `<video:*>` field without
 * escaping. One ampersand in an upload path or in a project title would make
 * the whole document unparseable, so everything admin-authored is escaped here.
 */
function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * A sitemap may only list absolute URLs, and Google drops the whole `<url>`
 * block when one of them is malformed. Anything that is not a real http(s)
 * URL — a relative upload path, an empty string the admin left behind — is
 * skipped rather than emitted broken.
 */
function absolute(src: string | null | undefined): string | undefined {
  if (!src) return undefined;
  try {
    const url = new URL(src);
    return url.protocol === "http:" || url.protocol === "https:"
      ? xml(url.toString())
      : undefined;
  } catch {
    return undefined;
  }
}

function images(...sources: Array<string | null | undefined>): string[] | undefined {
  const list = [...new Set(sources.map(absolute).filter((src): src is string => !!src))];
  return list.length > 0 ? list : undefined;
}

/**
 * The canonical URL for a route, XML-escaped. `path` carries admin-authored
 * slugs and `<loc>` is interpolated raw by Next (see `xml` above), so one
 * ampersand in a slug would otherwise take the whole document down with it.
 */
function loc(locale: string, path: string): string {
  return xml(`${siteConfig.url}/${locale}${path}`);
}

function buildAlternates(path: string) {
  return {
    ...Object.fromEntries(i18n.locales.map((l) => [l, loc(l, path)])),
    /* The same fallback the <head> annotations declare — the two hreflang
       clusters have to agree or Google discards the pair. */
    "x-default": loc(i18n.defaultLocale, path),
  };
}

/**
 * `lastmod` only helps when it is true: Google leans on it to decide what to
 * recrawl and discounts sitemaps that stamp every URL with the current time.
 * An unparseable or missing date yields `undefined`, which drops the element
 * rather than inventing one.
 */
function lastModified(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** The freshest of several dates — `undefined` when none of them is usable. */
function newest(...dates: Array<Date | undefined>): Date | undefined {
  const times = dates.filter((date): date is Date => date instanceof Date);
  return times.length > 0
    ? new Date(Math.max(...times.map((date) => date.getTime())))
    : undefined;
}

/** The newest edit across a collection — what a listing page really changed on. */
function newestOf(records: Array<{ updated_at?: string | null }>): Date | undefined {
  return newest(...records.map((record) => lastModified(record.updated_at)));
}

/**
 * Google ignores `<priority>` (and `<changefreq>`, which is why it is not
 * emitted at all — declaring "monthly" for a page nobody touches is a claim
 * the sitemap cannot keep). It is kept only as an honest statement of relative
 * importance for the crawlers that still read it.
 */
function priorityFor(path: string): number {
  if (path === "") return 1;
  if (path === "/services") return 0.9;
  if (path === "/contact") return 0.8;
  return 0.7;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const locales = i18n.locales as readonly Locale[];

  /* One pass over the API: the page tree per language, plus the three
     collections per language. */
  const [contentPairs, servicesByLocale, projectsByLocale, postsByLocale] =
    await Promise.all([
      Promise.all(
        locales.map(async (locale) => [locale, await getContent(locale)] as const),
      ),
      Promise.all(
        locales.map(async (locale) => [locale, await fetchServices(locale)] as const),
      ),
      Promise.all(
        locales.map(async (locale) => [locale, await fetchProjects(locale)] as const),
      ),
      Promise.all(
        locales.map(async (locale) => [locale, await fetchBlogPosts(locale)] as const),
      ),
    ]);

  const contentByLocale = Object.fromEntries(contentPairs) as Record<
    Locale,
    Awaited<ReturnType<typeof getContent>>
  >;
  const services = Object.fromEntries(servicesByLocale) as Record<Locale, ApiService[]>;
  const projects = Object.fromEntries(projectsByLocale) as Record<Locale, ApiProject[]>;
  const posts = Object.fromEntries(postsByLocale) as Record<Locale, ApiBlogPost[]>;

  /* A page or record switched to "no indexing" in the admin is left out of the
     sitemap as well, so the two never contradict each other. */
  const indexable = (locale: Locale, page: PageKey) =>
    contentByLocale[locale]?.seo?.[page]?.robots?.index !== false;

  /* When the page was last edited in the admin. Absent until the API ships the
     `updated` map, in which case the entry simply carries no `lastmod`. */
  const editedAt = (locale: Locale, page: PageKey) =>
    lastModified(contentByLocale[locale]?.updated?.[page]);

  /**
   * A listing page changes when its records change, not only when an editor
   * touches its copy — publishing a post genuinely rewrites /blog. The
   * homepage carries all three, since it previews services, work and posts.
   */
  const contentAge = (locale: Locale, path: string) => {
    const fromServices = newestOf(services[locale] ?? []);
    const fromProjects = newestOf(projects[locale] ?? []);
    const fromPosts = newest(
      ...(posts[locale] ?? []).map(
        (post) => lastModified(post.updated_at) ?? lastModified(post.published_at),
      ),
    );

    if (path === "") return newest(fromServices, fromProjects, fromPosts);
    if (path === "/services") return fromServices;
    if (path === "/portfolio") return fromProjects;
    if (path === "/blog") return fromPosts;
    return undefined;
  };

  for (const { path, page } of staticPaths) {
    for (const locale of locales) {
      if (!indexable(locale, page)) continue;

      entries.push({
        url: loc(locale, path),
        lastModified: newest(editedAt(locale, page), contentAge(locale, path)),
        priority: priorityFor(path),
        alternates: { languages: buildAlternates(path) },
      });
    }
  }

  for (const locale of locales) {
    if (!indexable(locale, "service-detail")) continue;

    for (const service of services[locale] ?? []) {
      if (service.seo?.robots?.index === false) continue;

      entries.push({
        url: loc(locale, `/services/${service.slug}`),
        lastModified: lastModified(service.updated_at),
        priority: 0.8,
        alternates: { languages: buildAlternates(`/services/${service.slug}`) },
        images: images(service.seo?.og_image),
      });
    }
  }

  for (const locale of locales) {
    if (!indexable(locale, "project-detail")) continue;

    for (const project of projects[locale] ?? []) {
      if (project.seo?.robots?.index === false) continue;

      const entry: Entry = {
        url: loc(locale, `/portfolio/${project.slug}`),
        lastModified: lastModified(project.updated_at),
        priority: 0.7,
        alternates: { languages: buildAlternates(`/portfolio/${project.slug}`) },
        /* The cover and the case-study gallery, which is what a portfolio page
           is mostly made of — image results are a real entry point for it. */
        images: images(project.cover_image, ...project.gallery.slice(0, 10)),
      };

      /* Google needs a thumbnail, a title and a description for every video it
         indexes; a clip without a cover image is left out rather than
         submitted incomplete. An uploaded file is the media itself
         (`content_loc`), a YouTube/Vimeo link is a player page (`player_loc`). */
      const video = resolveProjectVideo(project);
      const thumbnail = absolute(project.cover_image);
      const source = video && absolute(video.src);

      if (video && thumbnail && source) {
        entry.videos = [
          {
            title: xml(project.title),
            description: xml(project.summary || project.title),
            thumbnail_loc: thumbnail,
            ...(video.kind === "file"
              ? { content_loc: source }
              : { player_loc: source }),
          },
        ];
      }

      entries.push(entry);
    }
  }

  for (const locale of locales) {
    if (!indexable(locale, "blog-detail")) continue;

    for (const post of posts[locale] ?? []) {
      if (post.seo?.robots?.index === false) continue;

      entries.push({
        url: loc(locale, `/blog/${post.slug}`),
        /* An edited post is fresher than its publication date; either beats
           stamping it with the moment the sitemap was fetched. */
        lastModified: lastModified(post.updated_at) ?? lastModified(post.published_at),
        priority: 0.6,
        alternates: { languages: buildAlternates(`/blog/${post.slug}`) },
        images: images(post.cover_image, post.seo?.og_image),
      });
    }
  }

  /* Two records that share a slug across collections, or an API that repeats a
     row, would otherwise list the same URL twice — which Google reads as a
     sloppy sitemap. First entry wins. */
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
