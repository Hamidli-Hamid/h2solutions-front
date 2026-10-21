import { getDictionary } from "@/lib/dictionaries";
import {
  fetchBlogPosts,
  fetchContent,
  fetchProjects,
  fetchServices,
  type ApiContent,
  type ApiService,
} from "@/lib/api";
import type { PageKey } from "@/lib/content";
import { i18n, localeNames, type Locale } from "@/i18n-config";
import { localeUrl, resolveSite, siteConfig } from "@/lib/site-config";
import { contactNumbers, countryName } from "@/lib/format";
import { entityDefinition, splitProfiles } from "@/lib/jsonld";

/**
 * `/llms.txt` — the site, in one plain-text file, for the language models
 * behind AI answers.
 *
 * It is a convention (llmstxt.org), not a standard: no engine is obliged to
 * read it, and it replaces nothing. Everything here is also in the HTML, the
 * structured data and the sitemap — a curated index of the same material, at
 * the URLs the canonical tags name. Every line is generated from the same API
 * the pages render from, so it cannot drift out of date, and it lists only
 * sections that have content.
 *
 * The page and service lists are in Azerbaijani (the default language, served
 * from the bare path), with the services repeated in English; the other
 * languages are linked from the Languages line.
 */
const lang = i18n.defaultLocale;

/** Same bound as the sitemap: a hung API answers 503 instead of holding the request. */
const READ_TIMEOUT_MS = 10_000;

/** The sitemap's rule: a page switched to "no indexing" in the admin is not advertised. */
function indexable(content: ApiContent | null, page: PageKey): boolean {
  return content?.seo?.[page]?.robots?.index !== false;
}

/** `[` and `]` would end a link label early. */
function label(text: string): string {
  return text.replace(/[[\]]/g, (char) => `\\${char}`);
}

/** One list item per record, with the text an editor actually wrote. */
function list(
  items: Array<{ title: string; url: string; summary?: string | null }>,
): string {
  return items
    .map(({ title, url, summary }) => {
      const note = summary?.replace(/\s+/g, " ").trim();
      return `- [${label(title)}](${url})${note ? `: ${note}` : ""}`;
    })
    .join("\n");
}

/**
 * A service's full description (its one-line summary until one is written). A
 * row without a title in this language is skipped rather than filled in from
 * another language, and a service the admin keeps out of the index is left out
 * here too, as in the sitemap.
 */
function serviceItems(services: ApiService[], locale: Locale, content: ApiContent | null) {
  if (!indexable(content, "service-detail")) return [];
  return services
    .filter((service) => service.title.trim() !== "" && service.seo?.robots?.index !== false)
    .map((service) => ({
      title: service.title,
      url: localeUrl(locale, `/services/${service.slug}`),
      summary: service.description || service.summary,
    }));
}

export async function GET() {
  let data;
  try {
    const options = { timeoutMs: READ_TIMEOUT_MS };
    data = await Promise.all([
      getDictionary(lang),
      getDictionary("en"),
      fetchContent(lang, options),
      fetchContent("en", options),
      fetchServices(lang, options),
      fetchServices("en", options),
      fetchProjects(lang, options),
      fetchBlogPosts(lang, options),
    ]);
  } catch (err) {
    console.error("llms.txt: API read failed, answering 503:", err);

    /* Never a 200 without the service lists: a reader would take the shorter
       file as the whole site. */
    return new Response("llms.txt temporarily unavailable.\n", {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Retry-After": "300",
        "Cache-Control": "no-store",
      },
    });
  }

  const [dict, en, content, contentEn, services, servicesEn, allProjects, allPosts] = data;
  const projects = indexable(content, "project-detail")
    ? allProjects.filter((project) => project.seo?.robots?.index !== false)
    : [];
  const posts = indexable(content, "blog-detail")
    ? allPosts.filter((post) => post.seo?.robots?.index !== false)
    : [];
  const site = resolveSite(dict);
  const url = (path: string = "") => localeUrl(lang, path);

  const { company, personal } = splitProfiles(site.social);
  const country = countryName(site.addressCountry);
  const { phone } = contactNumbers(dict.contact);

  const facts = [
    `- Website: ${siteConfig.url}/`,
    `- Based in: ${[site.addressLocality, country].filter(Boolean).join(", ")}`,
    ...(site.founder
      ? [`- Founder: ${site.founder}${personal[0] ? ` (${personal[0]})` : ""}`]
      : []),
    ...(company.length > 0 ? [`- Profiles: ${company.join(" · ")}`] : []),
    `- Languages: ${i18n.locales
      .map((locale) => `[${localeNames[locale]}](${localeUrl(locale)})`)
      .join(" · ")}`,
  ];

  const sections = [
    `# ${dict.meta.siteName}`,
    ``,
    `> ${entityDefinition(en)}`,
    ``,
    entityDefinition(dict),
    ``,
    ...facts,
    ``,
    `## Səhifələr`,
    ``,
    list(
      [
        { page: "home" as const, title: dict.nav.home, url: url(), summary: dict.hero.subtitle },
        { page: "about" as const, title: dict.about.title, url: url("/about"), summary: dict.about.story },
        { page: "services" as const, title: dict.services.title, url: url("/services"), summary: dict.services.intro },
        /* A listing is named only once it lists something — the empty hubs are
           `noindex` and out of the sitemap for the same reason. */
        ...(allProjects.length > 0
          ? [{ page: "portfolio" as const, title: dict.portfolio.title, url: url("/portfolio"), summary: dict.portfolio.subtitle }]
          : []),
        ...(allPosts.length > 0
          ? [{ page: "blog" as const, title: dict.blog.title, url: url("/blog"), summary: dict.blog.subtitle }]
          : []),
        { page: "contact" as const, title: dict.contact.title, url: url("/contact"), summary: dict.contact.subtitle },
      ].filter((item) => indexable(content, item.page)),
    ),
  ];

  const azServices = serviceItems(services, lang, content);
  if (azServices.length > 0) {
    sections.push(``, `## ${dict.services.title}`, ``, list(azServices));
  }

  const enServices = serviceItems(servicesEn, "en", contentEn);
  if (enServices.length > 0) {
    sections.push(``, `## Services (English)`, ``, list(enServices));
  }

  if (projects.length > 0) {
    sections.push(
      ``,
      `## ${dict.portfolio.title}`,
      ``,
      list(
        projects.map((project) => ({
          title: project.title,
          url: url(`/portfolio/${project.slug}`),
          summary: project.summary,
        })),
      ),
    );
  }

  if (posts.length > 0) {
    sections.push(
      ``,
      `## ${dict.blog.title}`,
      ``,
      list(
        posts.map((post) => ({
          title: post.title,
          url: url(`/blog/${post.slug}`),
          summary: post.excerpt,
        })),
      ),
    );
  }

  sections.push(
    ``,
    `## Contact`,
    ``,
    `- Email: ${dict.contact.email}`,
    // Left out entirely while the contact data still carries the placeholder.
    ...(phone ? [`- Phone: ${phone}`] : []),
    `- Full URL list: ${siteConfig.url}/sitemap.xml`,
    ``,
  );

  return new Response(sections.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}
