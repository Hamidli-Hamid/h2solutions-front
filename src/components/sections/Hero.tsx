import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { Icon } from "@/components/ui/Icon";
import { OrbitDecor } from "@/components/ui/OrbitDecor";
import { localePath, type Locale } from "@/i18n-config";
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
  const cards = dict.hero.services;

  /* Trust chips, editable with the rest of the hero in the admin. An editor
     who empties the list gets the three `usp` headings back, so the row is
     never blank. */
  const proofPoints = (
    dict.hero.proofPoints?.length
      ? dict.hero.proofPoints
      : dict.usp.items.map((item) => item.title)
  )
    .filter((point) => point.trim() !== "")
    .slice(0, 3);

  return (
    /* `data-spotlight`: the cursor field below follows the pointer across
       the whole fold. `overflow-hidden` is for the orbit, which is wider than
       the panel it sits behind and must never widen the page. */
    <section className="hero-canvas overflow-hidden" data-spotlight>
      <div aria-hidden className="spotlight" />
      <OrbitDecor
        className="orbit-in hidden lg:block"
        style={{ right: "-13rem", top: "46%", width: "58rem", height: "58rem", translate: "0 -50%" }}
      />
      <div className="hero-shell container-h2 py-8 md:py-10 lg:pt-10 lg:pb-8 xl:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_1fr] lg:items-stretch lg:gap-12 xl:gap-16">
          {/* LEFT — brand message, choreographed top to bottom on load.
              The h1 and the lead are the LCP candidates, so they get
              `rise-solid` — a transform-only entrance that keeps them fully
              painted from the first frame (an opacity ramp would push LCP
              out by the length of the animation). The satellite pieces fade
              and rise in behind them. */}
          <div className="flex flex-col justify-center">
            <span className="rise inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-background-elevated)]/70 px-3 py-1.5 text-xs font-medium tracking-wide text-[color:var(--color-foreground-soft)] backdrop-blur">
              <span
                aria-hidden
                className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)] shadow-[var(--shadow-glow)]"
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-[color:var(--color-accent)] opacity-60 motion-reduce:hidden" />
              </span>
              {dict.hero.badge}
            </span>

            {/* `type-display` is fluid, so the headline no longer steps at
                breakpoints — it tracks the viewport from 380px to 1920px and
                keeps the same optical weight throughout. `text-balance`
                keeps the longer locales (de/ru) from dropping an orphan. */}
            {/* The space keeps the phrases apart for anything reading the text
                without CSS ("üçüntexniki"). It is part of the same string: a
                separate {" "} would be emitted after a `<!-- -->` marker. */}
            <h1
              className="type-display rise-solid mt-7 text-balance xl:mt-9"
              style={{ "--d": "40ms" } as React.CSSProperties}
            >
              {accent ? `${lead} ` : lead}
              {accent && (
                <span className="accent-text mt-2 block">{accent}</span>
              )}
            </h1>

            <p
              className="type-lead rise-solid mt-6 max-w-xl xl:mt-7 min-[1400px]:max-w-2xl"
              style={{ "--d": "120ms" } as React.CSSProperties}
            >
              {dict.hero.subtitle}
            </p>

            <ul className="rise mt-8 flex flex-wrap gap-2.5 xl:mt-9" style={{ "--d": "220ms" } as React.CSSProperties}>
              {proofPoints.map((point) => (
                <li key={point} className="chip py-1.5 pl-2 pr-3.5 text-[0.8125rem] text-[color:var(--color-foreground-soft)]">
                  <CheckCircleIcon
                    aria-hidden
                    className="h-4 w-4 flex-none text-[color:var(--color-accent)]"
                  />
                  {point}
                </li>
              ))}
            </ul>

            <div
              className="rise mt-9 flex flex-wrap gap-3 xl:mt-10 xl:gap-4"
              style={{ "--d": "320ms" } as React.CSSProperties}
            >
              <Link
                href={localePath(lang, "/contact")}
                data-magnetic
                className="btn-primary max-sm:w-full max-sm:justify-center"
              >
                <span>{dict.hero.ctaPrimary}</span>
                <ArrowRightIcon aria-hidden className="h-4 w-4" />
              </Link>
              <Link
                href={localePath(lang, "/portfolio")}
                className="btn-secondary max-sm:w-full max-sm:justify-center"
              >
                {dict.hero.ctaSecondary}
              </Link>
            </div>

            <p
              className="rise mt-5 inline-flex items-center gap-2 text-xs text-[color:var(--color-foreground-muted)]"
              style={{ "--d": "420ms" } as React.CSSProperties}
            >
              <ClockIcon aria-hidden className="h-4 w-4 flex-none" />
              {dict.contact.subtitle}
            </p>
          </div>

          {/* RIGHT — core services as a bento block inside one framed panel.
              `beam-border` runs a slow conic highlight around the frame; the
              cards inside carry the cursor spotlight. The panel settles in
              (`rise-panel`: a short lift plus a touch of scale) a beat after
              the headline, and its cards cascade in behind it. */}
          <div
            className="panel beam-border rise-panel flex flex-col overflow-hidden shadow-[0_28px_70px_-45px_color-mix(in_oklab,var(--color-accent)_85%,transparent)]"
            style={{ "--d": "180ms" } as React.CSSProperties}
          >
            <div className="relative z-1 flex items-center justify-between gap-3 border-b border-[color:var(--color-border)] px-4 py-3.5 md:px-5 xl:px-6 xl:py-4">
              <h2 className="section-label">{dict.hero.servicesTitle}</h2>
              <Link
                href={localePath(lang, "/services")}
                className="group inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-foreground-muted)] transition hover:text-[color:var(--color-accent)]"
              >
                {dict.common.learnMore}
                <ArrowRightIcon
                  aria-hidden
                  className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            {/* `auto-rows-fr`: the six cards are the same size, so a row sizes to
                its tallest card and both cells fill it. */}
            <ul className="hero-services relative z-1 grid flex-1 auto-rows-fr gap-3 p-3 sm:grid-cols-2 md:p-3.5 xl:gap-4 xl:p-4">
              {cards.map((service, position) => (
                /* The entrance sits on the `li`, not the card: `rise` keeps
                   its final transform, and on the card that would pin the
                   hover lift. */
                <li
                  key={service.name}
                  className="rise flex"
                  style={{ "--d": `${380 + position * 70}ms` } as React.CSSProperties}
                >
                  <Link
                    data-glow
                    href={
                      publishedSlugs.has(service.slug)
                        ? localePath(lang, `/services/${service.slug}`)
                        : localePath(lang, "/services")
                    }
                    className="service-card glow-card sheen group flex w-full flex-col p-4 xl:p-5"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="icon-tile h-10 w-10 flex-none xl:h-11 xl:w-11"
                      >
                        <Icon
                          name={service.icon}
                          className="h-5 w-5 xl:h-[1.375rem] xl:w-[1.375rem]"
                        />
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
