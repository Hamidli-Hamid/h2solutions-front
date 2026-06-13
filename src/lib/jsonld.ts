import { siteConfig } from "@/lib/site-config";
import { i18n, type Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";
import type { ApiService } from "@/lib/api";

function sanitize(value: string): string {
  return value.replace(/</g, "\\u003c");
}

export function jsonLdScript(payload: unknown): string {
  return sanitize(JSON.stringify(payload));
}

export function organizationJsonLd(dict: Dictionary, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.brand,
    legalName: siteConfig.brand,
    alternateName: dict.meta.siteName,
    url: `${siteConfig.url}/${lang}`,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/icon.svg`,
      width: 512,
      height: 512,
    },
    image: `${siteConfig.url}/opengraph-image`,
    description: dict.meta.defaultDescription,
    founder: {
      "@type": "Person",
      name: siteConfig.founder,
      url: siteConfig.social.linkedin,
    },
    sameAs: [
      siteConfig.social.linkedin,
      siteConfig.social.github,
      siteConfig.social.twitter,
    ].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Baku",
      addressCountry: "AZ",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: dict.contact.email,
      telephone: dict.contact.phone,
      areaServed: ["AZ", "Worldwide"],
      availableLanguage: ["Azerbaijani", "English", "Russian"],
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
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteConfig.url}/#business`,
    name: siteConfig.brand,
    image: `${siteConfig.url}/opengraph-image`,
    url: `${siteConfig.url}/${lang}`,
    telephone: dict.contact.phone,
    email: dict.contact.email,
    priceRange: "$$",
    description: dict.meta.defaultDescription,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Baku",
      addressCountry: "AZ",
    },
    areaServed: ["AZ", "Worldwide"],
    founder: { "@type": "Person", name: siteConfig.founder },
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
    availableLanguage: ["az", "en", "ru"],
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
