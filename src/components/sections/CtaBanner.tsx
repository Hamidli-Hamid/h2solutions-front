import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import type { Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  lang: Locale;
  dict: Dictionary;
  /** Overrides for the homepage conversion panel; other pages keep the default copy. */
  title?: string;
  subtitle?: string;
  className?: string;
};

export function CtaBanner({ lang, dict, title, subtitle, className }: Props) {
  return (
    <section className={className ?? "section-rule reveal"}>
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

          {/* Restrained technical motif — decorative only. */}
          <svg
            aria-hidden
            viewBox="0 0 120 96"
            className="pointer-events-none absolute right-8 top-1/2 hidden h-28 -translate-y-1/2 text-[color:var(--color-accent)] opacity-45 lg:block"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          >
            <path d="M60 18 90 34v30L60 80 30 64V34z" strokeOpacity="0.75" />
            <path d="M60 18v30m0 0 30-14m-30 14L30 34m30 14v32" strokeOpacity="0.35" />
            <path d="M8 48h14M98 48h14M60 4v10M60 84v8" strokeOpacity="0.3" />
            <circle cx="60" cy="48" r="3.5" fill="currentColor" stroke="none" />
            <circle cx="8" cy="48" r="2" fill="currentColor" stroke="none" />
            <circle cx="112" cy="48" r="2" fill="currentColor" stroke="none" />
          </svg>

          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center lg:pr-40">
            <div>
              <h2 className="text-2xl font-bold md:text-[1.75rem]">
                {title ?? (
                  <>
                    {dict.contact.title}.{" "}
                    <span className="accent-text">{dict.common.getStarted}</span>
                  </>
                )}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--color-foreground-soft)] md:text-base">
                {subtitle ?? dict.contact.subtitle}
              </p>
            </div>
            <Link href={`/${lang}/contact`} className="btn-primary self-start">
              {dict.hero.ctaPrimary}
              <ArrowRightIcon aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
