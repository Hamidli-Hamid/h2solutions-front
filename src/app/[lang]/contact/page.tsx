import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

import { PageHeader } from "@/components/ui/PageHeader";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale } from "@/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { resolveSite, siteConfig } from "@/lib/site-config";
import { breadcrumbJsonLd, contactPageJsonLd } from "@/lib/jsonld";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);

  return pageMetadata("contact", {
    lang,
    path: "/contact",
    title: dict.contact.title,
    description: dict.contact.subtitle,
  });
}

export default async function ContactPage({
  params,
}: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.contact;
  const site = resolveSite(dict);

  const breadcrumb = breadcrumbJsonLd([
    { name: dict.nav.home, url: `${siteConfig.url}/${lang}` },
    { name: t.title, url: `${siteConfig.url}/${lang}/contact` },
  ]);

  /* All outbound channels derive from the two dictionary values, so a phone or
     address change in the JSON propagates to tel:, wa.me and mailto: at once. */
  const telHref = `tel:${t.phone.replace(/[^\d+]/g, "")}`;
  const whatsappHref = `https://wa.me/${t.phone.replace(/\D/g, "")}`;
  const mailHref = `mailto:${t.email}?subject=${encodeURIComponent(t.mailSubject)}`;

  const channels: Array<{
    label: string;
    value: string;
    note: string;
    href: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    external?: boolean;
  }> = [
    {
      label: t.emailLabel,
      value: t.email,
      note: t.emailNote,
      href: mailHref,
      icon: EnvelopeIcon,
    },
    {
      label: t.phoneLabel,
      value: t.phone,
      note: t.phoneNote,
      href: telHref,
      icon: PhoneIcon,
    },
    {
      label: t.whatsappLabel,
      value: t.whatsappValue,
      note: t.whatsappNote,
      href: whatsappHref,
      icon: ChatBubbleOvalLeftEllipsisIcon,
      external: true,
    },
  ];

  const details: Array<{
    label: string;
    value: string;
    note: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
  }> = [
    { label: t.addressLabel, value: t.address, note: t.addressNote, icon: MapPinIcon },
    { label: t.hoursLabel, value: t.hours, note: t.hoursNote, icon: ClockIcon },
  ];

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
            <a href={mailHref} className="btn-primary">
              {t.direct.emailCta}
              <ArrowRightIcon aria-hidden className="h-4 w-4" />
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              {t.direct.whatsappCta}
            </a>
          </>
        }
      />

      {/* CHANNELS — direct ways to reach us on the left, a writing brief on the right. */}
      <section aria-labelledby="contact-channels-heading" className="reveal">
        <div className="container-h2 grid gap-10 pb-12 md:pb-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <p className="section-label">{t.infoTitle}</p>
            <h2
              id="contact-channels-heading"
              className="mt-3 text-2xl font-bold md:text-[1.75rem]"
            >
              {t.infoHeading}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--color-foreground-soft)] md:text-base">
              {t.infoSubtitle}
            </p>

            <ul className="mt-8 space-y-3">
              {channels.map((channel) => (
                <li key={channel.label}>
                  <a
                    href={channel.href}
                    {...(channel.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="panel panel-interactive group flex items-start gap-4 p-5"
                  >
                    <span aria-hidden className="icon-tile h-11 w-11 flex-none">
                      <channel.icon className="h-5 w-5" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-foreground-muted)]">
                        {channel.label}
                      </span>
                      <span className="mt-1 block break-words text-base font-medium transition group-hover:text-[color:var(--color-accent)]">
                        {channel.value}
                      </span>
                      <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
                        {channel.note}
                      </span>
                    </span>

                    <ArrowUpRightIcon
                      aria-hidden
                      className="h-4 w-4 flex-none text-[color:var(--color-foreground-muted)] transition group-hover:text-[color:var(--color-accent)]"
                    />
                  </a>
                </li>
              ))}
            </ul>

            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {details.map((detail) => (
                <div key={detail.label} className="panel flex items-start gap-4 p-5">
                  <span aria-hidden className="icon-tile h-11 w-11 flex-none">
                    <detail.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-foreground-muted)]">
                      {detail.label}
                    </dt>
                    <dd className="mt-1 text-[0.9375rem] font-medium">
                      {detail.value}
                    </dd>
                    <dd className="mt-1.5 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
                      {detail.note}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* BRIEF — what to put in the message, since there is no form to guide it. */}
          <aside className="panel relative h-fit overflow-hidden p-6 md:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[color:var(--color-accent)] opacity-12 blur-3xl"
            />

            <div className="relative">
              <p className="section-label">{t.brief.label}</p>
              <h2 className="mt-3 text-xl font-bold md:text-2xl">{t.brief.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-foreground-soft)]">
                {t.brief.text}
              </p>

              <ol className="mt-7 space-y-4">
                {t.brief.items.map((item, index) => (
                  <li
                    key={item}
                    className="flex gap-3.5 text-[0.9375rem] leading-relaxed text-[color:var(--color-foreground-soft)]"
                  >
                    <span
                      aria-hidden
                      className="icon-tile mt-0.5 h-6 w-6 flex-none font-[var(--font-display)] text-[0.6875rem] font-bold"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>

              <a href={mailHref} className="btn-primary mt-8">
                {t.brief.cta}
                <ArrowRightIcon aria-hidden className="h-4 w-4" />
              </a>

              <p className="mt-5 flex items-center gap-2 border-t border-[color:var(--color-border)] pt-5 text-[0.8125rem] text-[color:var(--color-foreground-muted)]">
                <ClockIcon aria-hidden className="h-4 w-4 flex-none text-[color:var(--color-accent)]" />
                <span>
                  {t.responseLabel}:{" "}
                  <strong className="font-semibold text-[color:var(--color-foreground)]">
                    {t.responseValue}
                  </strong>
                </span>
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* NEXT STEPS — what the enquiry turns into, as a three-node track. */}
      <section aria-labelledby="contact-next-heading" className="section-rule reveal">
        <div className="container-h2 py-12 md:py-14">
          <p className="section-label">{t.next.label}</p>
          <h2
            id="contact-next-heading"
            className="mt-3 text-2xl font-bold md:text-[1.75rem]"
          >
            {t.next.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[color:var(--color-foreground-soft)] md:text-base">
            {t.next.subtitle}
          </p>

          <ol className="mt-9 grid gap-5 md:grid-cols-3">
            {t.next.steps.map((step, index) => (
              <li key={step.title} className="panel flex flex-col p-6 md:p-7">
                <div className="flex items-center gap-4">
                  <span aria-hidden className="icon-tile h-11 w-11 flex-none">
                    <Icon name={step.icon} className="h-5 w-5" />
                  </span>
                  <span
                    aria-hidden
                    className="font-[var(--font-display)] text-sm font-bold tracking-wider text-[color:var(--color-foreground-muted)]"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold">{step.title}</h3>
                <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The homepage FAQ answers the questions that used to arrive through the form. */}
      <FaqAccordion dict={dict} />

      {/* DIRECT — closing band; every action here leaves the site, none loops back. */}
      <section aria-labelledby="contact-direct-heading" className="reveal">
        <div className="container-h2 py-12 md:py-14">
          <div className="panel relative overflow-hidden p-8 md:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-[color:var(--color-accent)] opacity-12 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-20 -bottom-32 h-72 w-72 rounded-full bg-[color:var(--color-accent-deep)] opacity-15 blur-3xl"
            />

            <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2
                  id="contact-direct-heading"
                  className="text-2xl font-bold md:text-[1.75rem]"
                >
                  {t.direct.title}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--color-foreground-soft)] md:text-base">
                  {t.direct.text}
                </p>
                <a
                  href={site.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-strong)]"
                >
                  {t.direct.linkedin}
                  <ArrowUpRightIcon aria-hidden className="h-4 w-4" />
                </a>
              </div>

              <div className="flex flex-wrap gap-3 md:justify-end">
                <a href={mailHref} className="btn-primary">
                  {t.direct.emailCta}
                  <ArrowRightIcon aria-hidden className="h-4 w-4" />
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  {t.direct.whatsappCta}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <JsonLd id="ld-contact" data={[contactPageJsonLd(dict, lang), breadcrumb]} />
    </div>
  );
}
