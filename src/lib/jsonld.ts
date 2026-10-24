import { localeUrl, resolveSite, siteConfig } from "@/lib/site-config";
import { i18n, type Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";
import type { ApiService } from "@/lib/api";
import { resolveProjectVideo } from "@/lib/video";
import { contactNumbers, countryName, firstSentence } from "@/lib/format";

type Node = Record<string, unknown>;

/* The site-wide entities. One id per entity, and every fact on it identical on
   every page and in every language — a node whose `url` changed with the page
   language was three conflicting claims about one company. */
export const ORGANIZATION_ID = `${siteConfig.url}/#organization`;
export const FOUNDER_ID = `${siteConfig.url}/#founder`;
export const WEBSITE_ID = `${siteConfig.url}/#website`;
const HOME_URL = `${siteConfig.url}/`;

/**
 * `<` becomes `\u003c`, so no string can close the script element or open an
 * HTML comment inside it (the escape the Next JSON-LD guide prescribes). The
 * two line separators are escaped as well, for parity with how a script
 * context has historically parsed them.
 */
function sanitize(value: string): string {
  return value
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function jsonLdScript(payload: unknown): string {
  return sanitize(JSON.stringify(payload));
}

/**
 * A link to one account rather than to a network. The unfilled defaults are
 * bare domain roots ("https://github.com/"), which point at the network, not
 * at us. The footer icons and `sameAs` both ask here, so they cannot disagree.
 */
export function isProfileUrl(href: string | null | undefined): href is string {
  if (!href) return false;
  try {
    const url = new URL(href);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.pathname.replace(/\/+$/, "") !== ""
    );
  } catch {
    return false;
  }
}

export function profileUrls(social: Record<string, string>): string[] {
  return Object.values(social).filter(isProfileUrl);
}

/** A person's LinkedIn page (`/in/…`) identifies the founder, not the company. */
function isPersonalProfile(href: string): boolean {
  const { hostname, pathname } = new URL(href);
  return /(^|\.)linkedin\.com$/.test(hostname) && pathname.startsWith("/in/");
}

/**
 * The admin's social links split by whose they are: the company's go on the
 * Organization, a personal profile on the founder's Person node.
 */
export function splitProfiles(social: Record<string, string>): {
  company: string[];
  personal: string[];
} {
  const profiles = profileUrls(social);
  return {
    company: profiles.filter((href) => !isPersonalProfile(href)),
    personal: profiles.filter(isPersonalProfile),
  };
}

/**
 * What the company is, in one liftable sentence: the opening sentence of the
 * about page's story in this language, so there is one editable source and
 * nothing to keep in step with the backend. The site description stands in
 * only when that copy is missing.
 */
export function entityDefinition(dict: Dictionary): string {
  return firstSentence(dict.about.story) || dict.meta.defaultDescription;
}

/**
 * The founder's name as this language spells it: the about page's founder
 * card, with the site-wide value only when the card is empty. The author
 * meta, the footer credit and the Person node all read it, so an Azerbaijani
 * page no longer names "Hamid Hamidli" next to a card that says "Həmid Həmidli".
 */
export function founderName(dict: Dictionary): string {
  return dict.about.founder.name.trim() || resolveSite(dict).founder.trim();
}

/**
 * Every other spelling of the founder's name the site publishes (the founder
 * card in each language and the site-wide value), without the one this page
 * uses as `name` — "Həmid Həmidli" and "Hamid Hamidli" are one person, and
 * saying so is what lets the per-language names be matched to one entity.
 */
export function founderAliases(dicts: Dictionary[], chosen: string): string[] {
  const names = [
    ...dicts.map((dict) => dict.about.founder.name.trim()),
    ...dicts.map((dict) => resolveSite(dict).founder.trim()),
  ].filter((name) => name !== "" && name !== chosen);
  return [...new Set(names)];
}

function areaServed(countryCode: string): Node[] | null {
  const name = countryName(countryCode);
  return name ? [{ "@type": "Country", name }] : null;
}

type SiteGraphInput = {
  dict: Dictionary;
  /** This language's services; `knowsAbout` is left out when none could be read. */
  services: ApiService[];
  /** From `founderAliases`. */
  founderNames: string[];
};

/**
 * The company, its founder and the website — the `ld-site` graph every page
 * carries. Every value comes from the admin, the site copy or `siteConfig`;
 * nothing is filled in from a default that nobody entered (`legalName`,
 * `priceRange` and the like appear only once the admin supplies them).
 */
export function siteGraphJsonLd({ dict, services, founderNames }: SiteGraphInput): Node[] {
  const site = resolveSite(dict);
  const { company, personal } = splitProfiles(site.social);
  const served = areaServed(site.addressCountry);
  const { phone } = contactNumbers(dict.contact);
  const definition = entityDefinition(dict);
  const knowsAbout = services.map((service) => service.title).filter(Boolean);
  const founder = founderName(dict);
  const role = dict.about.founder.role.trim();

  const organization: Node = {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORGANIZATION_ID,
    name: site.brand,
    url: HOME_URL,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/android-chrome-512x512.png`,
      width: 512,
      height: 512,
    },
    image: `${siteConfig.url}/opengraph-image`,
    description: dict.meta.defaultDescription,
    ...(definition ? { disambiguatingDescription: definition } : {}),
    ...(dict.contact.email ? { email: dict.contact.email } : {}),
    // The same real number the contactPoint carries; omitted with it.
    ...(phone ? { telephone: phone } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: site.addressLocality,
      addressCountry: site.addressCountry,
    },
    ...(served ? { areaServed: served } : {}),
    ...(knowsAbout.length > 0 ? { knowsAbout } : {}),
    ...(founder ? { founder: { "@id": FOUNDER_ID } } : {}),
    ...(company.length > 0 ? { sameAs: company } : {}),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      ...(dict.contact.email ? { email: dict.contact.email } : {}),
      /* Omitted rather than published as the shipped placeholder — see
         `realPhone`. */
      ...(phone ? { telephone: phone } : {}),
      ...(served ? { areaServed: served } : {}),
      // The working languages the about page states: the six the site ships.
      availableLanguage: [...i18n.locales],
    },
    ...(site.priceRange ? { priceRange: site.priceRange } : {}),
  };

  const person: Node | null = founder
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": FOUNDER_ID,
        name: founder,
        ...(founderNames.length === 1 ? { alternateName: founderNames[0] } : {}),
        ...(founderNames.length > 1 ? { alternateName: founderNames } : {}),
        ...(role ? { jobTitle: role } : {}),
        ...(personal.length > 0 ? { sameAs: personal } : {}),
        worksFor: { "@id": ORGANIZATION_ID },
      }
    : null;

  const website: Node = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: HOME_URL,
    name: site.brand,
    description: dict.meta.defaultDescription,
    inLanguage: [...i18n.locales],
    publisher: { "@id": ORGANIZATION_ID },
  };

  return person ? [organization, person, website] : [organization, website];
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
  const url = localeUrl(lang, `/services/${service.slug}`);
  const served = areaServed(resolveSite(dict).addressCountry);

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: service.title,
    description: service.summary,
    serviceType: service.title,
    url,
    provider: { "@id": ORGANIZATION_ID },
    ...(served ? { areaServed: served } : {}),
    /* Languages belong to the channel the service is bought through, not to
       the Service itself (`inLanguage`/`availableLanguage` are not Service
       properties). */
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: localeUrl(lang, "/contact"),
      availableLanguage: [...i18n.locales],
    },
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
  };
}

/**
 * The service page as a page: when its content last changed. Emitted only
 * with a real date — the caller omits it when the API has none.
 */
export function servicePageJsonLd(service: ApiService, lang: Locale, dateModified: string) {
  const url = localeUrl(lang, `/services/${service.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    inLanguage: lang,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": `${url}#service` },
    dateModified,
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
    url: localeUrl(lang, `/portfolio/${project.slug}`),
    inLanguage: lang,
    ...(images.length > 0 && { image: images }),
    ...(videoNode && { video: videoNode }),
    ...(project.year && { dateCreated: String(project.year) }),
    creator: { "@id": ORGANIZATION_ID },
    ...(project.client && {
      about: { "@type": "Organization", name: project.client },
    }),
  };
}

export function blogJsonLd(dict: Dictionary, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": localeUrl(lang, "/blog#blog"),
    name: dict.blog.title,
    description: dict.blog.subtitle,
    url: localeUrl(lang, "/blog"),
    inLanguage: lang,
    publisher: { "@id": ORGANIZATION_ID },
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
    author?: { name: string | null; url?: string | null };
  },
  lang: Locale,
  /** `resolveSite(dict).founder` — a post by the founder points at `#founder`. */
  founder: string,
) {
  const url = localeUrl(lang, `/blog/${post.slug}`);

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
    author: authorNode(post.author, founder),
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": localeUrl(lang, "/blog#blog") },
  };
}

function authorNode(
  author: { name: string | null; url?: string | null } | undefined,
  founder: string,
): Node {
  const name = author?.name?.trim();
  if (!name) return { "@id": ORGANIZATION_ID };
  if (founder && name.toLocaleLowerCase() === founder.trim().toLocaleLowerCase()) {
    return { "@id": FOUNDER_ID };
  }
  return {
    "@type": "Person",
    name,
    ...(isProfileUrl(author?.url) ? { url: author?.url } : {}),
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
    url: localeUrl(lang, "/contact"),
    inLanguage: lang,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": ORGANIZATION_ID },
  };
}

export function aboutPageJsonLd(dict: Dictionary, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: dict.about.title,
    description: dict.about.story,
    url: localeUrl(lang, "/about"),
    inLanguage: lang,
    mainEntity: { "@id": ORGANIZATION_ID },
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
    isPartOf: { "@id": WEBSITE_ID },
  };
}

function isPlainObject(value: unknown): value is Node {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function withoutKeys(node: Node, keys: string[]): Node {
  return Object.fromEntries(Object.entries(node).filter(([key]) => !keys.includes(key)));
}

/**
 * The admin's JSON-LD field as a list of nodes: one node, a list, a
 * `{"@graph": [...]}` wrapper, or any of those still encoded as a JSON string
 * (the backend's `array` cast lets a string through). `null` when the value is
 * none of these.
 */
function adminNodeList(admin: unknown): Node[] | null {
  let value = admin;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (isPlainObject(value) && Array.isArray(value["@graph"])) value = value["@graph"];
  const nodes = (Array.isArray(value) ? value : [value]).filter(isPlainObject);
  return nodes.length > 0 ? nodes : null;
}

/**
 * Lays the nodes typed into the admin's JSON-LD field over the generated ones.
 * A node whose `@id` matches a generated node extends it — admin keys win,
 * except `@id` and `@type`, which the generated node keeps — so a fact with no
 * admin column (a founding date, a registered name) lands on the one
 * Organization instead of creating a second. Any other node is appended. A
 * node aimed at another language (`inLanguage` a string other than this
 * page's) is skipped.
 *
 * Never throws: an unusable value is logged and ignored, and the generated
 * graph is always what survives. Output still goes through `jsonLdScript()`.
 */
export function mergeAdminNodes(generated: Node[], admin: unknown, lang: Locale): Node[] {
  if (admin === undefined || admin === null || admin === "") return generated;

  try {
    const nodes = adminNodeList(admin);
    if (!nodes) {
      console.warn("Ignoring admin structured_data: expected a JSON-LD node, a list of nodes or an @graph");
      return generated;
    }

    const merged = generated.map((node) => ({ ...node }));
    for (const node of nodes) {
      const language = node.inLanguage;
      if (typeof language === "string" && language !== lang) continue;

      const own = withoutKeys(node, ["@context"]);
      const id = own["@id"];
      const index = typeof id === "string" ? merged.findIndex((item) => item["@id"] === id) : -1;
      if (index === -1) {
        merged.push(own);
        continue;
      }

      const base = merged[index];
      /* On an extension, a language tag says which pages receive it — it is
         not a fact about the generated entity (WebSite already lists six). */
      const extension = typeof language === "string" ? withoutKeys(own, ["inLanguage"]) : own;
      merged[index] = { ...base, ...extension, "@id": base["@id"], "@type": base["@type"] };
    }
    return merged;
  } catch (err) {
    console.error("Admin structured_data could not be merged; publishing the generated graph:", err);
    return generated;
  }
}
