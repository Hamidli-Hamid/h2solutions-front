import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { i18n, isLocale } from "@/i18n-config";
import { siteConfig } from "@/lib/site-config";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/jsonld";
import { BriefcaseIcon } from "@heroicons/react/24/outline";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/portfolio">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const url = `${siteConfig.url}/${lang}/portfolio`;
  return {
    title: dict.portfolio.title,
    description: dict.portfolio.subtitle,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        i18n.locales.map((l) => [l, `${siteConfig.url}/${l}/portfolio`]),
      ),
    },
    openGraph: {
      title: `${dict.portfolio.title} — ${siteConfig.brand}`,
      description: dict.portfolio.subtitle,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.portfolio.title} — ${siteConfig.brand}`,
      description: dict.portfolio.subtitle,
    },
  };
}

export default async function PortfolioPage({
  params,
}: PageProps<"/[lang]/portfolio">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const url = `${siteConfig.url}/${lang}/portfolio`;
  const breadcrumb = breadcrumbJsonLd([
    { name: dict.nav.home, url: `${siteConfig.url}/${lang}` },
    { name: dict.portfolio.title, url },
  ]);
  const collection = collectionPageJsonLd({
    title: dict.portfolio.title,
    description: dict.portfolio.subtitle,
    url,
    lang,
  });

  return (
    <>
      <PageHeader
        eyebrow={dict.meta.siteName}
        title={dict.portfolio.title}
        subtitle={dict.portfolio.subtitle}
      />

      <section className="border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]">
        <div className="container-h2 py-20 md:py-28">
          <EmptyState
            icon={BriefcaseIcon}
            title={dict.portfolio.empty}
            description={dict.portfolio.subtitle}
            ctaLabel={dict.hero.ctaPrimary}
            ctaHref={`/${lang}/contact`}
          />
        </div>
      </section>

      <CtaBanner lang={lang} dict={dict} />
      <JsonLd id="ld-portfolio" data={[collection, breadcrumb]} />
    </>
  );
}
