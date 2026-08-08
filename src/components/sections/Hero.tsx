import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

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

  return (
    <section className="hero-grid">
      <div className="container-h2 py-12 md:py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
          {/* LEFT — brand message */}
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-background-elevated)]/70 px-3 py-1.5 text-xs font-medium tracking-wide text-[color:var(--color-foreground-soft)] backdrop-blur">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)] shadow-[var(--shadow-glow)]"
              />
              {dict.hero.badge}
            </span>

            <h1 className="mt-6 text-[2rem] font-bold leading-[1.12] sm:text-4xl lg:text-[2.625rem]">
              {lead}
              {accent && (
                <span className="mt-1 block text-[color:var(--color-accent)]">
                  {accent}
                </span>
              )}
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-[color:var(--color-foreground-soft)]">
              {dict.hero.subtitle}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={`/${lang}/contact`} className="btn-primary">
                {dict.hero.ctaPrimary}
                <ArrowRightIcon aria-hidden className="h-4 w-4" />
              </Link>
              <Link href={`/${lang}/portfolio`} className="btn-secondary">
                {dict.hero.ctaSecondary}
              </Link>
            </div>
          </div>

          {/* RIGHT — core services grid (no illustration, by design) */}
          <div>
            <h2 className="section-label">{dict.hero.servicesTitle}</h2>
            <ul className="mt-4 grid gap-3.5 sm:grid-cols-2">
              {dict.hero.services.map((service) => (
                <li key={service.name} className="flex">
                  <Link
                    href={
                      publishedSlugs.has(service.slug)
                        ? `/${lang}/services/${service.slug}`
                        : `/${lang}/services`
                    }
                    className="panel panel-interactive group flex w-full flex-col p-4"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="icon-tile h-10 w-10 flex-none transition group-hover:shadow-[var(--shadow-glow)]"
                      >
                        <Icon name={service.icon} className="h-5 w-5" />
                      </span>
                      <span className="text-[0.9375rem] font-semibold text-[color:var(--color-foreground)] transition group-hover:text-[color:var(--color-accent)]">
                        {service.name}
                      </span>
                    </span>

                    <span className="mt-2.5 flex-1 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
                      {service.description}
                    </span>

                    <ArrowRightIcon
                      aria-hidden
                      className="mt-3 h-4 w-4 self-end text-[color:var(--color-foreground-muted)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--color-accent)]"
                    />
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
