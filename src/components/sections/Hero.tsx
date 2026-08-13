import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";
import type { ApiService } from "@/lib/api";

type Props = {
  lang: Locale;
  dict: Dictionary;
  /** Published services — used to link a card straight to its detail page. */
  services: ApiService[];
};

/** Splits the H1 so the trailing phrase can be rendered in the accent colour. */
function splitTitle(title: string, accent: string) {
  const index = accent ? title.lastIndexOf(accent) : -1;
  if (index < 0) return { lead: title, accent: "" };
  return { lead: title.slice(0, index).trim(), accent: title.slice(index) };
}

export function Hero({ lang, dict, services }: Props) {
  const { lead, accent } = splitTitle(dict.hero.title, dict.hero.titleAccent);
  const publishedSlugs = new Set(services.map((service) => service.slug));

  /* The three selling points already written for every locale in `usp` —
     reused here as trust chips so the hero has no locale-specific copy. */
  const proofPoints = dict.usp.items.slice(0, 3);

  return (
    <section className="hero-grid">
      <div className="hero-shell container-h2 py-8 md:py-10 lg:pt-10 lg:pb-8 xl:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_1fr] lg:items-stretch lg:gap-12 xl:gap-16">
          {/* LEFT — brand message */}
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-background-elevated)]/70 px-3 py-1.5 text-xs font-medium tracking-wide text-[color:var(--color-foreground-soft)] backdrop-blur">
              <span
                aria-hidden
                className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)] shadow-[var(--shadow-glow)]"
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-[color:var(--color-accent)] opacity-60 motion-reduce:hidden" />
              </span>
              {dict.hero.badge}
            </span>

            {/* The step up waits for 1400px: below it the left column is too
                narrow to hold the title on one line, and above it the 92rem
                container caps the measure — so there is no third step either,
                a larger size past that point would only wrap.
                `text-balance` keeps the longer locales (de/ru) from dropping
                a one-word orphan line. */}
            <h1 className="mt-6 text-balance text-[2.125rem] font-bold leading-[1.1] sm:text-[2.75rem] lg:text-[3.25rem] xl:mt-8 min-[1400px]:text-[3.5rem]">
              {lead}
              {accent && (
                <span className="accent-text mt-1 block">{accent}</span>
              )}
            </h1>

            <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-[color:var(--color-foreground-soft)] xl:mt-6 min-[1400px]:max-w-2xl min-[1400px]:text-[1.1875rem]">
              {dict.hero.subtitle}
            </p>

            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3 xl:mt-9 xl:gap-x-8">
              {proofPoints.map((point) => (
                <li
                  key={point.title}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-foreground-soft)] xl:text-[0.9375rem]"
                >
                  <CheckCircleIcon
                    aria-hidden
                    className="h-[1.125rem] w-[1.125rem] flex-none text-[color:var(--color-accent)] xl:h-5 xl:w-5"
                  />
                  {point.title}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3 xl:mt-10 xl:gap-4">
              <Link
                href={`/${lang}/contact`}
                className="btn-primary max-sm:w-full max-sm:justify-center"
              >
                {dict.hero.ctaPrimary}
                <ArrowRightIcon aria-hidden className="h-4 w-4" />
              </Link>
              <Link
                href={`/${lang}/portfolio`}
                className="btn-secondary max-sm:w-full max-sm:justify-center"
              >
                {dict.hero.ctaSecondary}
              </Link>
            </div>

            <p className="mt-4 inline-flex items-center gap-2 text-xs text-[color:var(--color-foreground-muted)]">
              <ClockIcon aria-hidden className="h-4 w-4 flex-none" />
              {dict.contact.subtitle}
            </p>
          </div>

          {/* RIGHT — core services: cards inside one framed panel */}
          <div className="panel flex flex-col overflow-hidden shadow-[0_28px_70px_-45px_color-mix(in_oklab,var(--color-accent)_85%,transparent)]">
            <div className="flex items-center justify-between gap-3 border-b border-[color:var(--color-border)] px-4 py-3.5 md:px-5 xl:px-6 xl:py-4">
              <h2 className="section-label">{dict.hero.servicesTitle}</h2>
              <Link
                href={`/${lang}/services`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-foreground-muted)] transition hover:text-[color:var(--color-accent)]"
              >
                {dict.common.learnMore}
                <ArrowRightIcon aria-hidden className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* No auto-rows-fr: rows size to their own content, so the panel
                never grows taller than the copy beside it needs. */}
            <ul className="grid flex-1 gap-3 p-3 sm:grid-cols-2 md:p-3.5 xl:gap-4 xl:p-4">
              {dict.hero.services.map((service) => (
                <li key={service.name} className="flex">
                  <Link
                    href={
                      publishedSlugs.has(service.slug)
                        ? `/${lang}/services/${service.slug}`
                        : `/${lang}/services`
                    }
                    className="service-card group flex w-full flex-col p-4 xl:p-5"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="icon-tile h-10 w-10 flex-none transition group-hover:border-[color:var(--color-accent)] group-hover:shadow-[var(--shadow-glow)] xl:h-11 xl:w-11"
                      >
                        <Icon name={service.icon} className="h-5 w-5 xl:h-[1.375rem] xl:w-[1.375rem]" />
                      </span>
                      <span className="flex-1 text-[0.9375rem] font-semibold text-[color:var(--color-foreground)] transition group-hover:text-[color:var(--color-accent)] xl:text-base">
                        {service.name}
                      </span>
                      <span aria-hidden className="arrow-chip flex-none">
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </span>
                    </span>

                    <span className="mt-2.5 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)] xl:mt-3 xl:text-[0.875rem]">
                      {service.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
