import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { fetchService, fetchServices } from "@/lib/api";
import { i18n, isLocale } from "@/i18n-config";
import { siteConfig } from "@/lib/site-config";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/jsonld";

export async function generateStaticParams() {
  const all = await Promise.all(
    i18n.locales.map(async (lang) => {
      const services = await fetchServices(lang);
      return services.map((s) => ({ lang, slug: s.slug }));
    }),
  );
  return all.flat();
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/services/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const service = await fetchService(slug, lang);
  if (!service) return {};
  const url = `${siteConfig.url}/${lang}/services/${slug}`;
  return {
    title: service.title,
    description: service.summary,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        i18n.locales.map((l) => [l, `${siteConfig.url}/${l}/services/${slug}`]),
      ),
    },
    openGraph: {
      title: `${service.title} — ${siteConfig.brand}`,
      description: service.summary,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.title} — ${siteConfig.brand}`,
      description: service.summary,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: PageProps<"/[lang]/services/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, service, allServices] = await Promise.all([
    getDictionary(lang),
    fetchService(slug, lang),
    fetchServices(lang),
  ]);

  if (!service) notFound();

  const related = allServices.filter((s) => s.slug !== slug);

  const includedLabel =
    lang === "az" ? "Nə daxildir?" : lang === "ru" ? "Что входит?" : "What's included?";

  const breadcrumb = breadcrumbJsonLd([
    { name: dict.nav.home, url: `${siteConfig.url}/${lang}` },
    { name: dict.services.title, url: `${siteConfig.url}/${lang}/services` },
    { name: service.title, url: `${siteConfig.url}/${lang}/services/${slug}` },
  ]);
  const serviceLd = serviceJsonLd(service, dict, lang);

  return (
    <>
      <PageHeader
        eyebrow={dict.services.title}
        title={service.title}
        subtitle={service.summary}
      />

      <article className="border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]">
        <div className="container-h2 grid gap-12 py-20 md:grid-cols-[1.4fr_1fr] md:py-28">
          <div>
            <p className="text-lg leading-relaxed text-[color:var(--color-foreground-soft)]">
              {service.description}
            </p>

            {service.features.length > 0 && (
              <>
                <h2 className="mt-12 text-2xl font-bold">{includedLabel}</h2>
                <ul className="mt-6 space-y-3">
                  {service.features.map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[color:var(--color-foreground-soft)]"
                    >
                      <span
                        aria-hidden
                        className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-[color:var(--color-accent)] shadow-[var(--shadow-glow)]"
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <aside className="card flex flex-col gap-5 p-7">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-foreground-muted)]">
              {dict.services.title}
            </p>
            <h2 className="text-lg font-semibold">{dict.common.getStarted}</h2>
            <p className="text-sm leading-relaxed text-[color:var(--color-foreground-muted)]">
              {dict.contact.subtitle}
            </p>
            <Link href={`/${lang}/contact`} className="btn-primary self-start">
              {dict.hero.ctaPrimary}
            </Link>
            {related.length > 0 && (
              <nav
                aria-label={dict.servicesPreview.viewAll}
                className="mt-2 border-t border-[color:var(--color-border)] pt-5"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-foreground-muted)]">
                  {dict.servicesPreview.viewAll}
                </p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {related.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/${lang}/services/${s.slug}`}
                        className="text-[color:var(--color-foreground-soft)] hover:text-[color:var(--color-accent)]"
                      >
                        {s.title} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </aside>
        </div>
      </article>

      <CtaBanner lang={lang} dict={dict} />
      <JsonLd id="ld-service" data={[serviceLd, breadcrumb]} />
    </>
  );
}
