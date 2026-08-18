import { getDictionary } from "@/lib/dictionaries";
import { fetchBlogPosts, fetchProjects, fetchServices } from "@/lib/api";
import { i18n } from "@/i18n-config";
import { siteConfig } from "@/lib/site-config";
import { realPhone } from "@/lib/format";

/**
 * `/llms.txt` — the site, in one plain-text file, for the language models
 * behind AI answers.
 *
 * It is a convention (llmstxt.org), not a standard: no engine is obliged to
 * read it, and it replaces nothing. Everything here is also in the HTML, the
 * structured data and the sitemap — this is a curated index of the same
 * material, in the default language, at the URLs the canonical tags name. It is
 * deliberately cheap to keep honest: every line is generated from the same API
 * the pages render from, so it cannot drift out of date.
 */
const lang = i18n.defaultLocale;

/** One list item per record, with the summary an editor actually wrote. */
function list(
  items: Array<{ title: string; url: string; summary?: string | null }>,
): string {
  return items
    .map(({ title, url, summary }) => {
      const note = summary?.replace(/\s+/g, " ").trim();
      return `- [${title}](${url})${note ? `: ${note}` : ""}`;
    })
    .join("\n");
}

export async function GET() {
  const [dict, services, projects, posts] = await Promise.all([
    getDictionary(lang),
    fetchServices(lang),
    fetchProjects(lang),
    fetchBlogPosts(lang),
  ]);

  const base = `${siteConfig.url}/${lang}`;

  const sections = [
    `# ${dict.meta.siteName}`,
    ``,
    `> ${dict.meta.defaultDescription}`,
    ``,
    `${dict.meta.siteName} is based in ${siteConfig.addressLocality}, ${siteConfig.addressCountry}, and publishes every page in ${i18n.locales.length} languages: ${i18n.locales.join(", ")}. Swap the language code in any URL below to read that version — ${i18n.locales
      .map((locale) => `${siteConfig.url}/${locale}`)
      .join(", ")}.`,
    ``,
    `## Pages`,
    ``,
    list([
      { title: dict.nav.home, url: base, summary: dict.hero.subtitle },
      { title: dict.about.title, url: `${base}/about`, summary: dict.about.story },
      {
        title: dict.services.title,
        url: `${base}/services`,
        summary: dict.services.intro,
      },
      {
        title: dict.portfolio.title,
        url: `${base}/portfolio`,
        summary: dict.portfolio.subtitle,
      },
      { title: dict.blog.title, url: `${base}/blog`, summary: dict.blog.subtitle },
      {
        title: dict.contact.title,
        url: `${base}/contact`,
        summary: dict.contact.subtitle,
      },
    ]),
  ];

  if (services.length > 0) {
    sections.push(
      ``,
      `## ${dict.services.title}`,
      ``,
      list(
        services.map((service) => ({
          title: service.title,
          url: `${base}/services/${service.slug}`,
          summary: service.summary,
        })),
      ),
    );
  }

  if (projects.length > 0) {
    sections.push(
      ``,
      `## ${dict.portfolio.title}`,
      ``,
      list(
        projects.map((project) => ({
          title: project.title,
          url: `${base}/portfolio/${project.slug}`,
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
          url: `${base}/blog/${post.slug}`,
          summary: post.excerpt,
        })),
      ),
    );
  }

  const phone = realPhone(dict.contact.phone);

  sections.push(
    ``,
    `## Contact`,
    ``,
    `- Email: ${dict.contact.email}`,
    // Left out entirely while the dictionary still carries the placeholder.
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
