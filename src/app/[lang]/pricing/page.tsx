import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, CheckIcon, ClockIcon } from "@heroicons/react/24/outline";

import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { DiscussLink } from "@/components/ui/DiscussLink";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary, type Dictionary } from "@/lib/dictionaries";
import { localePath, isLocale, type Locale } from "@/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { getPageSeo } from "@/lib/content";
import { localeUrl } from "@/lib/site-config";
import { projectChat } from "@/lib/format";
import {
  ORGANIZATION_ID,
  WEBSITE_ID,
  breadcrumbJsonLd,
  faqJsonLd,
  mergeAdminNodes,
} from "@/lib/jsonld";

/** The blog post that explains the price factors in depth. */
const PRICE_FACTORS_POST = "/blog/sayt-hazirlanmasi-qiymeti";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/pricing">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);

  return pageMetadata("pricing", {
    lang,
    path: "/pricing",
    title: dict.pricing.title,
    description: dict.pricing.metaDescription,
  });
}

/**
 * "1 500" with a no-break space in az, ru, kk and uz — how prices are written
 * there (Intl gives az "1.500"); "1,500" in English, "1.500" in German.
 */
function formatAmount(amount: number, lang: Locale): string {
  if (lang === "en" || lang === "de") {
    return new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }).format(amount);
  }
  return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}

function PriceTag({
  amount,
  lang,
  t,
  monthly,
  size = "lg",
}: {
  amount: number;
  lang: Locale;
  t: Dictionary["pricing"];
  monthly?: boolean;
  size?: "lg" | "md";
}) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-1.5">
      {t.fromPrefix && (
        <span className="text-sm text-[color:var(--color-foreground-soft)]">{t.fromPrefix}</span>
      )}
      <span
        className={`font-[family-name:var(--font-display)] font-bold tracking-tight ${
          size === "lg" ? "text-4xl md:text-[2.75rem]" : "text-2xl"
        }`}
      >
        {formatAmount(amount, lang)}
      </span>
      <span className="text-sm font-semibold text-[color:var(--color-foreground-soft)]">
        {t.currency}
        {t.from}
      </span>
      {monthly && (
        <span className="text-sm text-[color:var(--color-foreground-muted)]">/ {t.perMonth}</span>
      )}
    </p>
  );
}

export default async function PricingPage({ params }: PageProps<"/[lang]/pricing">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [dict, pageSeo] = await Promise.all([getDictionary(lang), getPageSeo(lang, "pricing")]);
  const t = dict.pricing;
  const chat = projectChat(dict.contact);
  const url = localeUrl(lang, "/pricing");

  const breadcrumb = breadcrumbJsonLd([
    { name: dict.nav.home, url: localeUrl(lang) },
    { name: t.label, url },
  ]);

  // Every listed price as an Offer with a minimum price, so search engines and
  // AI answers can quote "from X AZN" with the source.
  const offerOf = (name: string, description: string, price: number, monthly?: boolean) => ({
    "@type": "Offer",
    url,
    priceCurrency: "AZN",
    itemOffered: { "@type": "Service", name, description, provider: { "@id": ORGANIZATION_ID } },
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      minPrice: price,
      priceCurrency: "AZN",
      ...(monthly ? { unitCode: "MON", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" } } : {}),
    },
  });
  const pricingPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    name: t.title,
    description: t.metaDescription,
    url,
    inLanguage: lang,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    mainEntity: {
      "@type": "OfferCatalog",
      name: t.title,
      itemListElement: [
        ...t.packages.map((p) => offerOf(p.name, p.description, p.price)),
        ...t.services.map((s) => offerOf(s.name, s.description, s.price, "monthly" in s && Boolean(s.monthly))),
      ],
    },
  };

  return (
    <div className="tech-canvas">
      <PageHeader
        withGrid={false}
        breadcrumbs={{
          label: dict.nav.menu,
          items: [{ label: dict.nav.home, href: localePath(lang) }, { label: t.label }],
        }}
        eyebrow={t.label}
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <>
            <DiscussLink lang={lang} dict={dict} className="btn-primary">
              {dict.hero.ctaPrimary}
              <ArrowRightIcon aria-hidden className="h-4 w-4" />
            </DiscussLink>
            <Link href={localePath(lang, "/services")} className="btn-secondary">
              {dict.nav.services}
            </Link>
          </>
        }
      />

      {/* PACKAGES — the three website formats, the middle one highlighted. */}
      <section aria-labelledby="pricing-packages-heading" className="reveal">
        <div className="container-h2 pb-14 md:pb-20">
          <SectionHeading
            id="pricing-packages-heading"
            label={t.packagesLabel}
            title={t.packagesTitle}
            subtitle={t.packagesSubtitle}
          />

          <ul className="mt-9 grid gap-5 lg:grid-cols-3 lg:items-stretch">
            {t.packages.map((pkg) => {
              const featured = "featured" in pkg && Boolean(pkg.featured);
              const message = t.packageMessage.replace("{name}", pkg.name);
              return (
                <li key={pkg.key} className="flex">
                  <article
                    data-glow
                    className={`panel glow-card relative flex w-full flex-col p-6 md:p-8 ${
                      featured ? "pricing-featured" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="type-h3">{pkg.name}</h3>
                      {featured && <span className="pricing-badge">{t.popular}</span>}
                    </div>
                    <p className="mt-2.5 min-h-[3rem] text-sm leading-relaxed text-[color:var(--color-foreground-soft)]">
                      {pkg.description}
                    </p>

                    <div className="mt-6">
                      <PriceTag amount={pkg.price} lang={lang} t={t} />
                      <p className="mt-2 inline-flex items-center gap-1.5 text-[0.8125rem] text-[color:var(--color-foreground-soft)]">
                        <ClockIcon aria-hidden className="h-4 w-4 text-[color:var(--color-accent)]" />
                        {t.durationLabel}: <strong className="font-semibold text-[color:var(--color-foreground)]">{pkg.duration}</strong>
                      </p>
                    </div>

                    <ul className="mt-6 flex-1 space-y-3 border-t border-[color:var(--color-border)] pt-6 text-sm text-[color:var(--color-foreground-soft)]">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <CheckIcon aria-hidden className="mt-0.5 h-4 w-4 flex-none text-[color:var(--color-accent)]" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {chat ? (
                      <WhatsAppLink
                        number={chat.number}
                        message={message}
                        className={`${featured ? "btn-primary" : "btn-secondary"} mt-8 w-full justify-center`}
                      >
                        {t.packageCta}
                        <ArrowRightIcon aria-hidden className="h-4 w-4" />
                      </WhatsAppLink>
                    ) : (
                      <Link
                        href={localePath(lang, "/contact")}
                        className={`${featured ? "btn-primary" : "btn-secondary"} mt-8 w-full justify-center`}
                      >
                        {t.packageCta}
                      </Link>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* OTHER SERVICES — starting prices, each linked to its service page. */}
      <section aria-labelledby="pricing-services-heading" className="reveal">
        <div className="container-h2 pb-14 md:pb-20">
          <SectionHeading
            id="pricing-services-heading"
            label={t.servicesLabel}
            title={t.servicesTitle}
            subtitle={t.servicesSubtitle}
          />

          <ul className="mt-9 grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
            {t.services.map((service) => {
              const monthly = "monthly" in service && Boolean(service.monthly);
              const slug = "slug" in service ? service.slug : undefined;
              const message = t.packageMessage.replace("{name}", service.name);
              return (
                <li key={service.key} className="flex">
                  <article className="panel panel-interactive flex w-full flex-col p-6">
                    <span aria-hidden className="icon-tile h-11 w-11">
                      <Icon name={`heroicon-o-${service.icon}`} className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-base font-semibold md:text-[1.0625rem]">{service.name}</h3>
                    <p className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
                      {service.description}
                    </p>
                    <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-[color:var(--color-border)] pt-5">
                      <PriceTag amount={service.price} lang={lang} t={t} monthly={monthly} size="md" />
                      {slug ? (
                        <Link
                          href={localePath(lang, `/services/${slug}`)}
                          className="inline-flex items-center gap-2 text-[0.8125rem] font-medium text-[color:var(--color-accent)]"
                        >
                          {t.detailsCta}
                          <span className="arrow-chip h-6 w-6">
                            <ArrowRightIcon aria-hidden className="h-3 w-3" />
                          </span>
                        </Link>
                      ) : chat ? (
                        <WhatsAppLink
                          number={chat.number}
                          message={message}
                          className="inline-flex items-center gap-2 text-[0.8125rem] font-medium text-[color:var(--color-accent)]"
                        >
                          {t.packageCta}
                          <span className="arrow-chip h-6 w-6">
                            <ArrowRightIcon aria-hidden className="h-3 w-3" />
                          </span>
                        </WhatsAppLink>
                      ) : null}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* INCLUDED + FACTORS — what every price covers, and what moves it. */}
      <section aria-labelledby="pricing-included-heading" className="reveal">
        <div className="container-h2 grid gap-5 pb-14 md:pb-20 lg:grid-cols-2">
          <div className="panel p-6 md:p-8">
            <p className="section-label">{t.includedLabel}</p>
            <h2 id="pricing-included-heading" className="type-h3 mt-4">
              {t.includedTitle}
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {t.included.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[color:var(--color-foreground-soft)]">
                  <CheckIcon aria-hidden className="mt-0.5 h-4 w-4 flex-none text-[color:var(--color-accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-6 md:p-8">
            <p className="section-label">{t.factorsLabel}</p>
            <h2 className="type-h3 mt-4">{t.factorsTitle}</h2>
            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              {t.factors.map((factor) => (
                <div key={factor.title}>
                  <dt className="text-sm font-semibold">{factor.title}</dt>
                  <dd className="mt-1.5 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
                    {factor.text}
                  </dd>
                </div>
              ))}
            </dl>
            {lang === "az" && (
              <Link
                href={localePath(lang, PRICE_FACTORS_POST)}
                className="mt-6 inline-flex items-center gap-2 text-[0.8125rem] font-medium text-[color:var(--color-accent)]"
              >
                {t.factorsLink}
                <span className="arrow-chip h-6 w-6">
                  <ArrowRightIcon aria-hidden className="h-3 w-3" />
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* PAYMENT — three stages, numbered like the process strip. */}
      <section aria-labelledby="pricing-payment-heading" className="reveal">
        <div className="container-h2 pb-14 md:pb-20">
          <SectionHeading
            id="pricing-payment-heading"
            label={t.paymentLabel}
            title={t.paymentTitle}
            subtitle={t.paymentSubtitle}
          />
          <ol className="mt-9 grid gap-4 md:grid-cols-3 md:gap-5">
            {t.paymentSteps.map((step, index) => (
              <li key={step.title} className="panel p-6 md:p-7">
                <span aria-hidden className="step-ordinal select-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <FaqAccordion content={t.faq} />
      <CtaBanner lang={lang} dict={dict} title={t.ctaTitle} subtitle={t.ctaText} className="reveal" />

      <JsonLd
        id="ld-pricing"
        data={mergeAdminNodes([pricingPage, breadcrumb], pageSeo?.structured_data, lang)}
      />
      <JsonLd id="ld-pricing-faq" data={faqJsonLd(t.faq.items)} />
    </div>
  );
}
