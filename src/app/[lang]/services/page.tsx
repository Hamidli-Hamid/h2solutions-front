import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { fetchServices } from "@/lib/api";
import { i18n, isLocale } from "@/i18n-config";
import { siteConfig } from "@/lib/site-config";
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/jsonld";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const url = `${siteConfig.url}/${lang}/services`;
  return {
    title: dict.services.title,
    description: dict.services.intro,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        i18n.locales.map((l) => [l, `${siteConfig.url}/${l}/services`]),
      ),
    },
    openGraph: {
      title: `${dict.services.title} — ${siteConfig.brand}`,
      description: dict.services.intro,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.services.title} — ${siteConfig.brand}`,
      description: dict.services.intro,
    },
  };
}

export default async function ServicesHubPage({
  params,
}: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [dict, services] = await Promise.all([
    getDictionary(lang),
    fetchServices(lang),
  ]);

  const url = `${siteConfig.url}/${lang}/services`;
  const breadcrumb = breadcrumbJsonLd([
    { name: dict.nav.home, url: `${siteConfig.url}/${lang}` },
    { name: dict.services.title, url },
  ]);
  const collection = collectionPageJsonLd({
    title: dict.services.title,
    description: dict.services.intro,
    url,
    lang,
  });
  const itemList = itemListJsonLd(
    dict.services.title,
    services.map((s) => ({
      name: s.title,
      url: `${siteConfig.url}/${lang}/services/${s.slug}`,
    })),
  );

  return (
    <>
      <PageHeader
        eyebrow={dict.meta.siteName}
        title={dict.services.title}
        subtitle={dict.services.intro}
      />

      <section className="border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]">
        <div className="container-h2 py-20 md:py-28">
          {services.length === 0 ? (
            <div className="card flex flex-col items-center justify-center gap-3 p-12 text-center">
              <p className="text-base text-[color:var(--color-foreground-muted)]">
                {dict.portfolio.empty}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/${lang}/services/${service.slug}`}
                  className="card group flex flex-col p-6 md:p-7"
                  aria-label={service.title}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] text-[color:var(--color-accent)] transition group-hover:shadow-[var(--shadow-glow)]">
                    <Icon name={service.icon} className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold transition group-hover:text-[color:var(--color-accent)]">
                    {service.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[color:var(--color-foreground-soft)]">
                    {service.summary}
                  </p>
                  <span className="mt-6 text-sm font-medium text-[color:var(--color-accent)]">
                    {dict.common.learnMore} →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaBanner lang={lang} dict={dict} />
      <JsonLd
        id="ld-services"
        data={services.length > 0 ? [collection, itemList, breadcrumb] : [collection, breadcrumb]}
      />
    </>
  );
}
