import "server-only";
import type { Metadata } from "next";

import { i18n, ogLocales, xDefaultLocale, type Locale } from "@/i18n-config";
import { localeUrl, resolveSite, siteConfig } from "@/lib/site-config";
import { getPageSeo, type PageKey } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import type { ApiSeo } from "@/lib/api";

type BuildInput = {
  lang: Locale;
  /** Route under the language prefix — "" for the homepage, "/about", … */
  path: string;
  /** The languages this page exists in, when that is not all of them. */
  locales?: readonly Locale[];
  /** Copy the page derives from its own content, used when nothing is overridden. */
  title: string;
  description: string;
  /** Admin overrides: the page row for static routes, the record for detail routes. */
  seo?: ApiSeo | null;
  ogType?: "website" | "article";
  images?: Array<string | null | undefined>;
  publishedTime?: string | null;
  /** Skip the "— H2 Solutions" suffix the layout appends (used by the layout itself). */
  absoluteTitle?: boolean;
  /**
   * `resolveSite(dict).twitterHandle` — "" when none is set. Required so no
   * route can forget it: every route's `twitter` object replaces the layout's,
   * so a handle added in one place only was on 6 of 42 pages.
   */
  twitterHandle: string;
};

/**
 * Google renders about 580 CSS pixels of a title and 920 of a snippet before
 * cutting; ~60 and ~155 characters are the usual working equivalents. Nothing
 * is penalised for running longer — the sentence is simply truncated mid-word
 * in the result — so these are limits on *derived* copy only. Anything an
 * editor typed into the admin is published exactly as typed.
 */
const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 155;
const BRAND_SUFFIX = ` — ${siteConfig.brand}`;

/** Trimmed at a word boundary, so the snippet ends on a word and not a stump. */
function clamp(text: string, limit: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;

  const cut = clean.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  const kept = lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${kept.replace(/[\s,;:.\-–—]+$/, "")}…`;
}

/**
 * The brand, exactly once. Derived titles get it from the layout's
 * `title.template`, so the share cards have to reproduce that suffix rather
 * than add a second one — and a title that already names the brand keeps it.
 */
function withBrand(title: string): string {
  return title.includes(siteConfig.brand) ? title : `${title}${BRAND_SUFFIX}`;
}

function alternates(path: string, locales: readonly Locale[]) {
  return {
    ...Object.fromEntries(locales.map((locale) => [locale, localeUrl(locale, path)])),
    "x-default": localeUrl(xDefaultLocale(locales), path),
  };
}

/**
 * One metadata builder for every route, so canonical URLs, hreflang, Open
 * Graph and robots stay consistent — and so an editor's overrides are applied
 * the same way everywhere. Anything left blank in the admin keeps the value
 * derived from the page content.
 */
export function buildMetadata({
  lang,
  path,
  locales = i18n.locales,
  title,
  description,
  seo,
  ogType = "website",
  images = [],
  publishedTime,
  absoluteTitle = false,
  twitterHandle,
}: BuildInput): Metadata {
  const url = localeUrl(lang, path);
  const metaTitle = seo?.title || title;
  /* Page copy is written to be read on the page — `about.story` is a paragraph,
     a post's excerpt a lead-in. Cut to snippet length when it is standing in
     for a description nobody wrote; an admin-set one is left alone. */
  const metaDescription = seo?.description || clamp(description, DESCRIPTION_LIMIT);

  /* An overridden title, and the layout's own, are used verbatim; a derived one
     picks up the brand from the layout's title template. Either way the share
     cards repeat the resolved <title>, so the brand is never doubled.

     A long derived title (most blog headlines) skips the suffix: with it the
     line overruns and Google cuts the brand off mid-word anyway, which reads
     worse than a clean headline — and it appends the site name itself. */
  const isAbsolute =
    Boolean(seo?.title) ||
    absoluteTitle ||
    /* The layout's template appends the brand unconditionally, so a page whose
       own title already names it came out as "H2 Solutions haqqında — H2
       Solutions" — every /about page, in all six languages. */
    metaTitle.includes(siteConfig.brand) ||
    withBrand(metaTitle).length > TITLE_LIMIT;
  const shareTitle = isAbsolute ? metaTitle : withBrand(metaTitle);
  const ogDescription = metaDescription;

  const pictures = [seo?.og_image, ...images].filter(
    (src): src is string => Boolean(src),
  );

  /* A page's own artwork when it has some, otherwise the generated card — so
     `summary_large_image` always has an image to render. */
  const { shareImage } = siteConfig;
  const ogImages =
    pictures.length > 0
      ? pictures.map((src) => ({ url: src, alt: shareTitle }))
      : [
          {
            url: `${siteConfig.url}${shareImage.og}`,
            width: shareImage.width,
            height: shareImage.height,
            type: shareImage.type,
            alt: shareTitle,
          },
        ];
  const twitterImages =
    pictures.length > 0
      ? ogImages
      : [{ ...ogImages[0], url: `${siteConfig.url}${shareImage.twitter}` }];

  const robots = seo?.robots;

  return {
    title: isAbsolute ? { absolute: metaTitle } : metaTitle,
    description: metaDescription,
    alternates: {
      canonical: url,
      languages: alternates(path, locales),
    },
    openGraph: {
      type: ogType,
      siteName: siteConfig.brand,
      title: shareTitle,
      description: ogDescription,
      url,
      locale: ogLocales[lang],
      alternateLocale: locales
        .filter((locale) => locale !== lang)
        .map((locale) => ogLocales[locale]),
      images: ogImages,
      ...(publishedTime && { publishedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: ogDescription,
      images: twitterImages,
      ...(twitterHandle ? { site: twitterHandle, creator: twitterHandle } : {}),
    },
    ...(robots && {
      robots: {
        index: robots.index,
        follow: robots.follow,
        googleBot: {
          index: robots.index,
          follow: robots.follow,
          "max-video-preview": -1,
          "max-image-preview": "large" as const,
          "max-snippet": -1,
        },
      },
    }),
  };
}

/**
 * Metadata for a static route, with the admin overrides already fetched.
 */
export async function pageMetadata(
  page: PageKey,
  input: Omit<BuildInput, "seo" | "twitterHandle">,
): Promise<Metadata> {
  const [seo, handle] = await Promise.all([
    getPageSeo(input.lang, page),
    twitterHandleFor(input.lang),
  ]);
  return buildMetadata({ ...input, seo, twitterHandle: handle });
}

/** The site's X/Twitter handle as set in the admin; "" when none is. */
export async function twitterHandleFor(lang: Locale): Promise<string> {
  return resolveSite(await getDictionary(lang)).twitterHandle.trim();
}

/**
 * Robots for a listing page that has nothing to list yet: kept out of the
 * index but still followed, so the navigation links keep working. Status stays
 * 200 and nothing is disallowed — the page must be fetchable for the
 * `noindex` to be read. It lifts itself as soon as the first record exists.
 */
export const EMPTY_LISTING_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};
