import "server-only";

import { availableLocales, i18n, xDefaultLocale, type Locale } from "@/i18n-config";
import { localeUrl, siteConfig } from "@/lib/site-config";
import {
  fetchBlogPosts,
  fetchContent,
  fetchProjects,
  fetchServices,
  type ApiBlogPost,
  type ApiContent,
  type ApiProject,
  type ApiService,
} from "@/lib/api";
import type { PageKey } from "@/lib/content";
import { resolveProjectVideo } from "@/lib/video";

/** One `<url>`. Every string in it is already XML-escaped. */
export type SitemapEntry = {
  url: string;
  lastModified?: Date;
  alternates: Record<string, string>;
  images?: string[];
  videos?: Array<{
    title: string;
    description: string;
    thumbnail_loc: string;
    content_loc?: string;
    player_loc?: string;
  }>;
};

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
 * A read that has not answered by then fails the sitemap with a 503 rather
 * than holding the request for the HTTP client's own (minutes-long) timeouts.
 */
const READ_TIMEOUT_MS = 10_000;

/**
 * Everything written into the XML is escaped here, once: one ampersand in an
 * upload path or in a project title would otherwise make the whole document
 * unparseable. Characters XML 1.0 does not allow at all (C0 controls other
 * than tab/newline/CR, U+FFFE/U+FFFF) cannot be escaped, so they are dropped —
 * one pasted control character in a title would otherwise break every URL.
 */
function xml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
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
 * The canonical URL for a route, XML-escaped, in exactly the form the page's
 * own `<link rel="canonical">` carries. Next resolves the home page against
 * `metadataBase` to the bare origin, so the root is written without its slash —
 * here, the one helper behind `<loc>`, `hreflang="az"` and `x-default`, so all
 * three agree with the head.
 */
function loc(locale: Locale, path: string): string {
  const url = localeUrl(locale, path);
  return xml(url === `${siteConfig.url}/` ? siteConfig.url : url);
}

function buildAlternates(
  path: string,
  locales: readonly Locale[] = i18n.locales,
): Record<string, string> {
  return {
    ...Object.fromEntries(locales.map((l) => [l, loc(l, path)])),
    /* The same fallback the <head> annotations declare — the two hreflang
       clusters have to agree or Google discards the pair. */
    "x-default": loc(xDefaultLocale(locales), path),
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
 * The detail page's date: `lastmod` covers the record *and* what the page
 * renders with it (its SEO row, FAQs, gallery); `updated_at` is the record
 * alone and stands in until the API sends `lastmod`.
 */
function recordModified(record: { lastmod?: string | null; updated_at?: string | null }) {
  return lastModified(record.lastmod || record.updated_at);
}

function byLocale<T>(pairs: Array<readonly [Locale, T]>): Record<Locale, T> {
  return Object.fromEntries(pairs) as Record<Locale, T>;
}

/**
 * Every indexable URL, per language, from one pass over the API.
 *
 * The reads are strict: an unreachable or failing API throws instead of
 * yielding a shorter list, and the route answers 503 — never a 200 that
 * silently withdraws URLs.
 */
export async function collectSitemapEntries(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];
  const locales = i18n.locales as readonly Locale[];

  const options = { timeoutMs: READ_TIMEOUT_MS };
  const [contentPairs, servicePairs, projectPairs, postPairs] = await Promise.all([
    Promise.all(locales.map(async (l) => [l, await fetchContent(l, options)] as const)),
    Promise.all(locales.map(async (l) => [l, await fetchServices(l, options)] as const)),
    Promise.all(locales.map(async (l) => [l, await fetchProjects(l, options)] as const)),
    Promise.all(locales.map(async (l) => [l, await fetchBlogPosts(l, options)] as const)),
  ]);

  const contentByLocale = byLocale<ApiContent | null>(contentPairs);
  const services = byLocale<ApiService[]>(servicePairs);
  const projects = byLocale<ApiProject[]>(projectPairs);
  const posts = byLocale<ApiBlogPost[]>(postPairs);

  /* A page or record switched to "no indexing" in the admin is left out of the
     sitemap as well, so the two never contradict each other. */
  const indexable = (locale: Locale, page: PageKey) =>
    contentByLocale[locale]?.seo?.[page]?.robots?.index !== false;

  /* A listing with nothing in it is `noindex` (see EMPTY_LISTING_ROBOTS), so
     it stays out of the sitemap too, until its first record is published. */
  const isEmptyListing = (locale: Locale, path: string) =>
    (path === "/portfolio" && projects[locale].length === 0) ||
    (path === "/blog" && posts[locale].length === 0);

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
    const fromServices = newestOf(services[locale]);
    const fromProjects = newestOf(projects[locale]);
    const fromPosts = newest(
      ...posts[locale].map(
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
      if (!indexable(locale, page) || isEmptyListing(locale, path)) continue;

      entries.push({
        url: loc(locale, path),
        lastModified: newest(editedAt(locale, page), contentAge(locale, path)),
        alternates: buildAlternates(path),
      });
    }
  }

  for (const locale of locales) {
    if (!indexable(locale, "service-detail")) continue;

    for (const service of services[locale]) {
      if (service.seo?.robots?.index === false) continue;

      entries.push({
        url: loc(locale, `/services/${service.slug}`),
        lastModified: recordModified(service),
        alternates: buildAlternates(`/services/${service.slug}`),
        images: images(service.seo?.og_image),
      });
    }
  }

  for (const locale of locales) {
    if (!indexable(locale, "project-detail")) continue;

    for (const project of projects[locale]) {
      if (project.seo?.robots?.index === false) continue;

      const entry: SitemapEntry = {
        url: loc(locale, `/portfolio/${project.slug}`),
        lastModified: recordModified(project),
        alternates: buildAlternates(`/portfolio/${project.slug}`),
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

    for (const post of posts[locale]) {
      if (post.seo?.robots?.index === false) continue;

      entries.push({
        url: loc(locale, `/blog/${post.slug}`),
        /* An edited post is fresher than its publication date; either beats
           stamping it with the moment the sitemap was fetched. */
        lastModified: recordModified(post) ?? lastModified(post.published_at),
        alternates: buildAlternates(`/blog/${post.slug}`, availableLocales(post.locales)),
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

/**
 * The document, byte for byte what Next's `app/sitemap.ts` convention wrote
 * (next/dist/build/webpack/loaders/metadata/resolve-route-data.js) plus the
 * one thing that convention cannot emit: the `<?xml-stylesheet?>` instruction
 * that gives a browser a readable table. Every XML parser and crawler skips a
 * processing instruction, so nothing about indexing depends on it. No
 * `<priority>` or `<changefreq>`: Google ignores both.
 */
export function renderSitemap(entries: SitemapEntry[]): string {
  const hasImages = entries.some((entry) => (entry.images?.length ?? 0) > 0);
  const hasVideos = entries.some((entry) => (entry.videos?.length ?? 0) > 0);

  let content = '<?xml version="1.0" encoding="UTF-8"?>\n';
  content += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';
  content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
  if (hasImages) content += ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
  if (hasVideos) content += ' xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"';
  content += ' xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  for (const entry of entries) {
    content += "<url>\n";
    content += `<loc>${entry.url}</loc>\n`;
    for (const [language, href] of Object.entries(entry.alternates)) {
      content += `<xhtml:link rel="alternate" hreflang="${language}" href="${href}" />\n`;
    }
    for (const image of entry.images ?? []) {
      content += `<image:image>\n<image:loc>${image}</image:loc>\n</image:image>\n`;
    }
    for (const video of entry.videos ?? []) {
      content += [
        "<video:video>",
        `<video:title>${video.title}</video:title>`,
        `<video:thumbnail_loc>${video.thumbnail_loc}</video:thumbnail_loc>`,
        `<video:description>${video.description}</video:description>`,
        ...(video.content_loc ? [`<video:content_loc>${video.content_loc}</video:content_loc>`] : []),
        ...(video.player_loc ? [`<video:player_loc>${video.player_loc}</video:player_loc>`] : []),
        "</video:video>\n",
      ].join("\n");
    }
    if (entry.lastModified) {
      content += `<lastmod>${entry.lastModified.toISOString()}</lastmod>\n`;
    }
    content += "</url>\n";
  }

  content += "</urlset>\n";
  return content;
}
