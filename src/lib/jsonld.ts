import { resolveSite, siteConfig } from "@/lib/site-config";
import { i18n, type Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";
import type { ApiService } from "@/lib/api";
import { resolveProjectVideo } from "@/lib/video";

function sanitize(value: string): string {
  return value.replace(/</g, "\\u003c");
}

/**
 * `sameAs` is meant to list profiles Google can tie back to the brand. The
 * unfilled defaults in `siteConfig.social` are bare domain roots
 * ("https://github.com/"), which point at the network rather than at us — so
 * only entries carrying a path survive.
 */
function profileUrls(social: Record<string, string>): string[] {
  return Object.values(social).filter((href) => {
    if (!href) return false;
    try {
      return new URL(href).pathname.replace(/\/+$/, "") !== "";
    } catch {
      return false;
    }
  });
}

export function jsonLdScript(payload: unknown): string {
  return sanitize(JSON.stringify(payload));
}

export function organizationJsonLd(dict: Dictionary, lang: Locale) {
  const site = resolveSite(dict);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: site.brand,
    legalName: site.brand,
    alternateName: dict.meta.siteName,
    url: `${siteConfig.url}/${lang}`,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/android-chrome-512x512.png`,
      width: 512,
      height: 512,
    },
    image: `${siteConfig.url}/opengraph-image`,
    description: dict.meta.defaultDescription,
    founder: {
      "@type": "Person",
      name: site.founder,
      url: site.social.linkedin,
    },
    sameAs: profileUrls(site.social),
    address: {
      "@type": "PostalAddress",
      addressLocality: site.addressLocality,
      addressCountry: site.addressCountry,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: dict.contact.email,
      telephone: dict.contact.phone,
      areaServed: [site.addressCountry, "Worldwide"],
      // Kept in step with the locales the site actually ships.
      availableLanguage: i18n.locales,
    },
  };
}

export function websiteJsonLd(dict: Dictionary, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: `${siteConfig.url}/${lang}`,
    name: dict.meta.siteName,
    description: dict.meta.defaultDescription,
    inLanguage: i18n.locales,
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function professionalServiceJsonLd(dict: Dictionary, lang: Locale) {
  const site = resolveSite(dict);

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteConfig.url}/#business`,
    name: site.brand,
    image: `${siteConfig.url}/opengraph-image`,
    url: `${siteConfig.url}/${lang}`,
    telephone: dict.contact.phone,
    email: dict.contact.email,
    priceRange: site.priceRange,
    description: dict.meta.defaultDescription,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.addressLocality,
      addressCountry: site.addressCountry,
    },
    areaServed: [site.addressCountry, "Worldwide"],
    founder: { "@type": "Person", name: site.founder },
  };
}

type Crumb = { name: string; url: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export function serviceJsonLd(service: ApiService, dict: Dictionary, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    serviceType: service.title,
    url: `${siteConfig.url}/${lang}/services/${service.slug}`,
    provider: { "@id": `${siteConfig.url}/#organization` },
    areaServed: ["AZ", "Worldwide"],
    availableLanguage: i18n.locales,
    ...(service.features.length > 0 && {
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: service.title,
        itemListElement: service.features.map((feat) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: feat },
        })),
      },
    }),
    inLanguage: lang,
    audience: { "@type": "BusinessAudience", audienceType: dict.about.title },
  };
}

export function itemListJsonLd(name: string, items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function projectJsonLd(
  project: {
    slug: string;
    title: string;
    summary: string;
    client: string | null;
    year: number | null;
    cover_image: string | null;
    gallery: string[];
    video_file?: string | null;
    video_url?: string | null;
    updated_at?: string | null;
  },
  lang: Locale,
) {
  const images = [project.cover_image, ...project.gallery].filter(
    (src): src is string => Boolean(src),
  );

  const video = resolveProjectVideo(project);
  /* Google only reads a VideoObject with a thumbnail and an upload date, so
     the node is emitted only when both are actually there. */
  const videoNode =
    video && images[0] && project.updated_at
      ? {
          "@type": "VideoObject",
          name: project.title,
          description: project.summary,
          thumbnailUrl: images[0],
          uploadDate: project.updated_at,
          ...(video.kind === "file"
            ? { contentUrl: video.src }
            : { embedUrl: video.src }),
        }
      : null;

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: `${siteConfig.url}/${lang}/portfolio/${project.slug}`,
    inLanguage: lang,
    ...(images.length > 0 && { image: images }),
    ...(videoNode && { video: videoNode }),
    ...(project.year && { dateCreated: String(project.year) }),
    creator: { "@id": `${siteConfig.url}/#organization` },
    ...(project.client && {
      about: { "@type": "Organization", name: project.client },
    }),
  };
}

export function blogJsonLd(dict: Dictionary, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${siteConfig.url}/${lang}/blog#blog`,
    name: dict.blog.title,
    description: dict.blog.subtitle,
    url: `${siteConfig.url}/${lang}/blog`,
    inLanguage: lang,
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function blogPostingJsonLd(
  post: {
    slug: string;
    title: string;
    excerpt: string;
    cover_image: string | null;
    published_at: string | null;
    updated_at?: string | null;
    author?: { name: string | null };
  },
  lang: Locale,
) {
  const url = `${siteConfig.url}/${lang}/blog/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: lang,
    ...(post.cover_image && { image: [post.cover_image] }),
    ...(post.published_at && {
      datePublished: post.published_at,
      // The real edit date when the API reports one — claiming a post was last
      // modified the day it went up is a fabricated date either way.
      dateModified: post.updated_at || post.published_at,
    }),
    author: post.author?.name
      ? { "@type": "Person", name: post.author.name }
      : { "@id": `${siteConfig.url}/#organization` },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    isPartOf: { "@id": `${siteConfig.url}/${lang}/blog#blog` },
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function contactPageJsonLd(dict: Dictionary, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: dict.contact.title,
    description: dict.contact.subtitle,
    url: `${siteConfig.url}/${lang}/contact`,
    inLanguage: lang,
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    mainEntity: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function aboutPageJsonLd(dict: Dictionary, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: dict.about.title,
    description: dict.about.story,
    url: `${siteConfig.url}/${lang}/about`,
    inLanguage: lang,
    mainEntity: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function collectionPageJsonLd(opts: {
  title: string;
  description: string;
  url: string;
  lang: Locale;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.title,
    description: opts.description,
    url: opts.url,
    inLanguage: opts.lang,
    isPartOf: { "@id": `${siteConfig.url}/#website` },
  };
}
