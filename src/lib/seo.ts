import "server-only";
import type { Metadata } from "next";

import { i18n, ogLocales, type Locale } from "@/i18n-config";
import { siteConfig } from "@/lib/site-config";
import { getPageSeo, type PageKey } from "@/lib/content";
import type { ApiSeo } from "@/lib/api";

type BuildInput = {
  lang: Locale;
  /** Route under the language prefix — "" for the homepage, "/about", … */
  path: string;
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
};

function alternates(path: string) {
  return Object.fromEntries(
    i18n.locales.map((locale) => [locale, `${siteConfig.url}/${locale}${path}`]),
  );
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
  title,
  description,
  seo,
  ogType = "website",
  images = [],
  publishedTime,
  absoluteTitle = false,
}: BuildInput): Metadata {
  const url = `${siteConfig.url}/${lang}${path}`;
  const metaTitle = seo?.title || title;
  const metaDescription = seo?.description || description;
  /* The share card mirrors the meta pair, so a page is never described twice. */
  const ogTitle = `${metaTitle} — ${siteConfig.brand}`;
  const ogDescription = metaDescription;

  const pictures = [seo?.og_image, ...images].filter(
    (src): src is string => Boolean(src),
  );

  const robots = seo?.robots;

  return {
    // An overridden meta title is used verbatim; a derived one still gets the
    // brand suffix from the layout's title template.
    title: seo?.title || absoluteTitle ? { absolute: metaTitle } : (metaTitle as string),
    description: metaDescription,
    alternates: {
      canonical: url,
      languages: {
        ...alternates(path),
        "x-default": `${siteConfig.url}/${i18n.defaultLocale}${path}`,
      },
    },
    openGraph: {
      type: ogType,
      siteName: siteConfig.brand,
      title: ogTitle,
      description: ogDescription,
      url,
      locale: ogLocales[lang],
      alternateLocale: i18n.locales
        .filter((locale) => locale !== lang)
        .map((locale) => ogLocales[locale]),
      ...(pictures.length > 0 && { images: pictures }),
      ...(publishedTime && { publishedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      ...(pictures.length > 0 && { images: pictures }),
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
  input: Omit<BuildInput, "seo">,
): Promise<Metadata> {
  const seo = await getPageSeo(input.lang, page);
  return buildMetadata({ ...input, seo });
}
