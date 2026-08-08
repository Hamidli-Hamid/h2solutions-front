import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { PageHeader } from "@/components/ui/PageHeader";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { WhyUs } from "@/components/sections/WhyUs";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { fetchServices } from "@/lib/api";
import { isLocale } from "@/i18n-config";
import { pageMetadata } from "@/lib/seo";
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

  return pageMetadata("services", {
    lang,
    path: "/services",
    title: dict.services.title,
    description: dict.services.intro,
  });
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
    <div className="tech-canvas">
      <PageHeader
        withGrid={false}
        breadcrumbs={{
          label: dict.nav.menu,
          items: [
            { label: dict.nav.home, href: `/${lang}` },
            { label: dict.services.title },
          ],
        }}
        eyebrow={dict.meta.siteName}
        title={dict.services.title}
        subtitle={dict.services.intro}
        actions={
          <>
            <Link href={`/${lang}/contact`} className="btn-primary">
              {dict.hero.ctaPrimary}
              <ArrowRightIcon aria-hidden className="h-4 w-4" />
            </Link>
            <Link href={`/${lang}/portfolio`} className="btn-secondary">
              {dict.hero.ctaSecondary}
            </Link>
          </>
        }
      />

      <section aria-label={dict.services.title}>
        <div className="container-h2 pb-12 md:pb-14">
          {services.length === 0 ? (
            <p className="panel p-10 text-center text-sm text-[color:var(--color-foreground-soft)]">
              {dict.services.empty}
            </p>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <li key={service.slug} className="flex">
                  <ServiceCard
                    service={service}
                    lang={lang}
                    ctaLabel={dict.common.learnMore}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <WhyUs dict={dict} />
      <ProcessSteps dict={dict} />
      <CtaBanner lang={lang} dict={dict} className="reveal" />

      <JsonLd
        id="ld-services"
        data={
          services.length > 0
            ? [collection, itemList, breadcrumb]
            : [collection, breadcrumb]
        }
      />
    </div>
  );
}
