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

/**
 * The brand, exactly once. Derived titles get it from the layout's
 * `title.template`, so the share cards have to reproduce that suffix rather
 * than add a second one — and a title that already names the brand keeps it.
 */
function withBrand(title: string): string {
  return title.includes(siteConfig.brand) ? title : `${title} — ${siteConfig.brand}`;
}

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

  /* An overridden title, and the layout's own, are used verbatim; a derived one
     picks up the brand from the layout's title template. Either way the share
     cards repeat the resolved <title>, so the brand is never doubled. */
  const isAbsolute = Boolean(seo?.title) || absoluteTitle;
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
      languages: {
        ...alternates(path),
        "x-default": `${siteConfig.url}/${i18n.defaultLocale}${path}`,
      },
    },
    openGraph: {
      type: ogType,
      siteName: siteConfig.brand,
      title: shareTitle,
      description: ogDescription,
      url,
      locale: ogLocales[lang],
      alternateLocale: i18n.locales
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
