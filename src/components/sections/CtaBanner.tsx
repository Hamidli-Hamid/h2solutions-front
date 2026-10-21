import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { SplitWords } from "@/components/ui/SplitWords";
import { localePath, type Locale } from "@/i18n-config";
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
      <div className="container-h2 py-14 md:py-20">
        {/* The one place on the page that gets the travelling border: it is
            the last thing above the footer, and the motion is what pulls the
            eye back up to the action after a long scroll. */}
        <div className="panel beam-border relative overflow-hidden rounded-[var(--radius-xl)] p-8 md:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[color:var(--color-accent)] opacity-12 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -bottom-32 h-80 w-80 rounded-full bg-[color:var(--color-accent-alt)] opacity-15 blur-3xl"
          />

          {/* Restrained technical motif — decorative only. */}
          <svg
            aria-hidden
            viewBox="0 0 120 96"
            className="pointer-events-none absolute right-10 top-1/2 hidden h-36 -translate-y-1/2 text-[color:var(--color-accent)] opacity-40 lg:block"
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

          <div className="relative z-1 grid gap-8 md:grid-cols-[1fr_auto] md:items-end lg:pr-44">
            <div>
              <h2 className="type-h2 text-balance">
                {title ? (
                  <SplitWords text={title} />
                ) : (
                  <>
                    {dict.contact.title}.{" "}
                    <span className="accent-text">{dict.common.getStarted}</span>
                  </>
                )}
              </h2>
              <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-[color:var(--color-foreground-soft)] md:text-base">
                {subtitle ?? dict.contact.subtitle}
              </p>
            </div>
            <Link
              href={localePath(lang, "/contact")}
              data-magnetic
              className="btn-primary self-start px-7 py-4 md:self-end"
            >
              <span>{dict.hero.ctaPrimary}</span>
              <ArrowRightIcon aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
