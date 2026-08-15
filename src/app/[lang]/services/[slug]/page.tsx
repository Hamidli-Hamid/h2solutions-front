import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  CheckIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { fetchService, fetchServices } from "@/lib/api";
import { i18n, isLocale } from "@/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { getPageSeo } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/jsonld";

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

  // A service carries its own overrides; the `service-detail` page row holds
  // the defaults for every service that has none.
  const template = await getPageSeo(lang, "service-detail");

  return buildMetadata({
    lang,
    path: `/services/${slug}`,
    title: service.title,
    description: service.summary,
    ogType: "article",
    seo: { ...template, ...(service.seo ?? {}) },
  });
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
  // Written per service in the admin panel; the block is skipped when empty.
  const faq = service.faq ?? [];

  const breadcrumb = breadcrumbJsonLd([
    { name: dict.nav.home, url: `${siteConfig.url}/${lang}` },
    { name: dict.services.title, url: `${siteConfig.url}/${lang}/services` },
    { name: service.title, url: `${siteConfig.url}/${lang}/services/${slug}` },
  ]);
  const serviceLd = serviceJsonLd(service, dict, lang);

  return (
    <div className="tech-canvas">
      <PageHeader
        withGrid={false}
        breadcrumbs={{
          label: dict.nav.menu,
          items: [
            { label: dict.nav.home, href: `/${lang}` },
            { label: dict.services.title, href: `/${lang}/services` },
            { label: service.title },
          ],
        }}
        eyebrow={dict.services.title}
        title={service.title}
        subtitle={service.summary}
        actions={
          <>
            <Link href={`/${lang}/contact`} className="btn-primary">
              {dict.hero.ctaPrimary}
              <ArrowRightIcon aria-hidden className="h-4 w-4" />
            </Link>
            <Link href={`/${lang}/services`} className="btn-secondary">
              {dict.servicesPreview.viewAll}
            </Link>
          </>
        }
      />

      <article>
        <div className="container-h2 grid items-start gap-8 pb-12 md:pb-14 lg:grid-cols-[1.6fr_1fr] lg:gap-10">
          <div>
            <div className="panel p-6 md:p-8">
              <span aria-hidden className="icon-tile h-11 w-11">
                <Icon name={service.icon} className="h-5 w-5" />
              </span>
              <p className="mt-5 text-base leading-[1.85] text-[color:var(--color-foreground-soft)]">
                {service.description}
              </p>
            </div>

            {service.features.length > 0 && (
              <section aria-labelledby="included-heading" className="mt-8">
                <h2 id="included-heading" className="text-xl font-bold md:text-2xl">
                  {dict.services.included}
                </h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="panel flex items-start gap-3 p-4 text-sm leading-relaxed text-[color:var(--color-foreground-soft)]"
                    >
                      <span
                        aria-hidden
                        className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border border-[color:var(--color-border-strong)] text-[color:var(--color-accent)]"
                      >
                        <CheckIcon className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {faq.length > 0 && (
              <div className="mt-8">
                <FaqAccordion
                  variant="inline"
                  content={{
                    label: dict.services.faq.label,
                    title: dict.services.faqTitle,
                    items: faq,
                  }}
                />
              </div>
            )}
          </div>

          {/* Rail: the contact card first, the other services under it. */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="panel p-6">
              <p className="section-label">{dict.services.title}</p>
              <h2 className="mt-3 text-lg font-semibold">
                {dict.services.startTitle}
              </h2>
              <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
                {dict.services.startText}
              </p>
              <Link
                href={`/${lang}/contact`}
                className="btn-primary mt-5 w-full justify-center px-4 py-2.5 text-sm"
              >
                {dict.hero.ctaPrimary}
                <ArrowRightIcon aria-hidden className="h-4 w-4" />
              </Link>

              <address className="mt-5 space-y-2.5 border-t border-[color:var(--color-border)] pt-5 text-sm not-italic text-[color:var(--color-foreground-soft)]">
                <div className="flex items-center gap-2.5">
                  <PhoneIcon
                    aria-hidden
                    className="h-4 w-4 flex-none text-[color:var(--color-accent)]"
                  />
                  <a
                    href={`tel:${dict.contact.phone.replace(/\s+/g, "")}`}
                    className="transition hover:text-[color:var(--color-accent)]"
                  >
                    {dict.contact.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <EnvelopeIcon
                    aria-hidden
                    className="h-4 w-4 flex-none text-[color:var(--color-accent)]"
                  />
                  <a
                    href={`mailto:${dict.contact.email}`}
                    className="transition hover:text-[color:var(--color-accent)]"
                  >
                    {dict.contact.email}
                  </a>
                </div>
              </address>
            </div>

            {related.length > 0 && (
              <nav aria-labelledby="related-heading" className="panel p-6">
                <h2 id="related-heading" className="text-lg font-semibold">
                  {dict.services.related}
                </h2>
                <ul className="mt-4">
                  {related.map((item) => (
                    <li
                      key={item.slug}
                      className="border-t border-[color:var(--color-border)] first:border-t-0 first:[&>a]:pt-0"
                    >
                      <Link
                        href={`/${lang}/services/${item.slug}`}
                        className="group flex items-start gap-3 py-3.5"
                      >
                        <span aria-hidden className="icon-tile h-9 w-9 flex-none">
                          <Icon name={item.icon} className="h-4 w-4" />
                        </span>
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="text-[0.875rem] font-medium leading-snug transition group-hover:text-[color:var(--color-accent)]">
                            {item.title}
                          </span>
                          <span className="line-clamp-2 text-[0.6875rem] leading-relaxed text-[color:var(--color-foreground-muted)]">
                            {item.summary}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/${lang}/services`}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-strong)]"
                >
                  {dict.servicesPreview.viewAll}
                  <ArrowRightIcon aria-hidden className="h-4 w-4" />
                </Link>
              </nav>
            )}
          </aside>
        </div>
      </article>

      <ProcessSteps dict={dict} />

      <CtaBanner lang={lang} dict={dict} className="reveal" />
      <JsonLd
        id="ld-service"
        data={
          faq.length > 0
            ? [serviceLd, breadcrumb, faqJsonLd(faq)]
            : [serviceLd, breadcrumb]
        }
      />
    </div>
  );
}
