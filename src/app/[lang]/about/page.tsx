import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";

import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale } from "@/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { resolveSite, siteConfig } from "@/lib/site-config";
import { aboutPageJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);

  return pageMetadata("about", {
    lang,
    path: "/about",
    title: dict.about.title,
    description: dict.about.story,
  });
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.about;
  const site = resolveSite(dict);

  const breadcrumb = breadcrumbJsonLd([
    { name: dict.nav.home, url: `${siteConfig.url}/${lang}` },
    { name: t.title, url: `${siteConfig.url}/${lang}/about` },
  ]);

  return (
    /* One continuous technical grid runs behind every section, as on the homepage. */
    <div className="tech-canvas">
      <PageHeader
        withGrid={false}
        breadcrumbs={{
          label: dict.nav.menu,
          items: [{ label: dict.nav.home, href: `/${lang}` }, { label: t.title }],
        }}
        eyebrow={t.label}
        title={t.title}
        subtitle={t.subtitle}
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

      {/* STORY — narrative on the left, founder identity card on the right. */}
      <section aria-labelledby="about-story-heading" className="reveal">
        <div className="container-h2 grid gap-10 pb-12 md:pb-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div>
            <p className="section-label">{t.storyLabel}</p>
            <h2
              id="about-story-heading"
              className="mt-3 text-2xl font-bold md:text-[1.75rem]"
            >
              {t.storyTitle}
            </h2>

            <div className="mt-6 space-y-4">
              {t.storyParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className={
                    index === 0
                      ? "text-base leading-relaxed text-[color:var(--color-foreground-soft)] md:text-[1.0625rem]"
                      : "text-[0.9375rem] leading-relaxed text-[color:var(--color-foreground-soft)]"
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <aside className="panel h-fit p-6 md:p-8">
            <p className="section-label">{t.founder.label}</p>

            <div className="mt-5 flex items-center gap-4">
              <span
                aria-hidden
                className="icon-tile h-14 w-14 flex-none font-[var(--font-display)] text-lg font-bold shadow-[var(--shadow-glow)]"
              >
                H2
              </span>
              <span>
                <span className="block text-lg font-semibold">{t.founder.name}</span>
                <span className="mt-0.5 block text-[0.8125rem] text-[color:var(--color-foreground-muted)]">
                  {t.founder.role}
                </span>
              </span>
            </div>

            <blockquote className="mt-6 border-l-2 border-[color:var(--color-accent)] pl-4 text-[0.9375rem] leading-relaxed text-[color:var(--color-foreground-soft)] italic">
              {t.founder.quote}
            </blockquote>

            <a
              href={site.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-strong)]"
            >
              {t.founder.linkedinLabel}
              <ArrowUpRightIcon aria-hidden className="h-4 w-4" />
            </a>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-foreground-muted)]">
              {t.factsTitle}
            </p>
            <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {t.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="border-t border-[color:var(--color-border)] pt-3"
                >
                  <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-[color:var(--color-foreground-muted)]">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium">{fact.value}</dd>
                </div>
              ))}
              <div className="border-t border-[color:var(--color-border)] pt-3 sm:col-span-2">
                <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-[color:var(--color-foreground-muted)]">
                  {dict.contact.emailLabel}
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${dict.contact.email}`}
                    className="font-mono text-sm transition hover:text-[color:var(--color-accent)]"
                  >
                    {dict.contact.email}
                  </a>
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {/* COMMITMENTS — one panel split into four figures. */}
      <section aria-labelledby="about-commitments-heading" className="reveal">
        <div className="container-h2 py-12 md:py-14">
          <p className="section-label">{t.commitments.label}</p>
          <h2
            id="about-commitments-heading"
            className="mt-3 text-2xl font-bold md:text-[1.75rem]"
          >
            {t.commitments.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[color:var(--color-foreground-soft)] md:text-base">
            {t.commitments.subtitle}
          </p>

          <dl className="panel mt-9 grid overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
            {t.commitments.items.map((item) => (
              /* Cell separators: rows on mobile, a 2×2 split on sm, one row on lg. */
              <div
                key={item.label}
                className="border-t border-[color:var(--color-border)] p-6 first:border-t-0 md:p-7 sm:[&:nth-child(-n+2)]:border-t-0 sm:[&:nth-child(2n)]:border-l lg:[&:nth-child(-n+4)]:border-t-0 lg:[&:nth-child(n+2)]:border-l"
              >
                <dt className="font-[var(--font-display)] text-2xl font-bold text-[color:var(--color-accent)] md:text-[1.75rem]">
                  {item.value}
                </dt>
                <dd className="mt-2 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
                  {item.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* VALUES */}
      <section aria-labelledby="about-values-heading" className="reveal">
        <div className="container-h2 py-12 md:py-14">
          <p className="section-label">{t.valuesLabel}</p>
          <h2
            id="about-values-heading"
            className="mt-3 text-2xl font-bold md:text-[1.75rem]"
          >
            {t.valuesTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[color:var(--color-foreground-soft)] md:text-base">
            {t.valuesSubtitle}
          </p>

          <ul className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {t.values.map((value, index) => (
              <li key={value.title} className="panel panel-interactive flex flex-col p-6">
                <span className="flex items-center justify-between">
                  <span aria-hidden className="icon-tile h-10 w-10">
                    <Icon name={value.icon} className="h-5 w-5" />
                  </span>
                  <span
                    aria-hidden
                    className="font-[var(--font-display)] text-sm font-bold tracking-wider text-[color:var(--color-foreground-muted)]"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </span>
                <h3 className="mt-5 text-base font-semibold">{value.title}</h3>
                <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
                  {value.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* TECH STACK */}
      <section aria-labelledby="about-stack-heading" className="reveal">
        <div className="container-h2 py-12 md:py-14">
          <p className="section-label">{t.stack.label}</p>
          <h2
            id="about-stack-heading"
            className="mt-3 text-2xl font-bold md:text-[1.75rem]"
          >
            {t.stack.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[color:var(--color-foreground-soft)] md:text-base">
            {t.stack.subtitle}
          </p>

          <ul className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {t.stack.groups.map((group) => (
              <li key={group.title} className="panel flex flex-col p-6">
                <span className="flex items-center gap-3">
                  <span aria-hidden className="icon-tile h-9 w-9 flex-none">
                    <Icon name={group.icon} className="h-[1.125rem] w-[1.125rem]" />
                  </span>
                  <h3 className="text-[0.9375rem] font-semibold">{group.title}</h3>
                </span>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-background)]/60 px-2.5 py-1 text-xs text-[color:var(--color-foreground-soft)]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* WHO WE WORK WITH */}
      <section aria-labelledby="about-audience-heading" className="reveal">
        <div className="container-h2 py-12 md:py-14">
          <p className="section-label">{t.audience.label}</p>
          <h2
            id="about-audience-heading"
            className="mt-3 text-2xl font-bold md:text-[1.75rem]"
          >
            {t.audience.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[color:var(--color-foreground-soft)] md:text-base">
            {t.audience.subtitle}
          </p>

          <ul className="mt-9 grid gap-5 md:grid-cols-2">
            {t.audience.items.map((item) => (
              <li
                key={item.title}
                className="panel panel-interactive flex items-start gap-4 p-6"
              >
                <span aria-hidden className="icon-tile h-11 w-11 flex-none">
                  <Icon name={item.icon} className="h-5 w-5" />
                </span>
                <span>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
                    {item.description}
                  </p>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ProcessSteps dict={dict} />
      <CtaBanner lang={lang} dict={dict} className="reveal" />

      <JsonLd id="ld-about" data={[aboutPageJsonLd(dict, lang), breadcrumb]} />
    </div>
  );
}
