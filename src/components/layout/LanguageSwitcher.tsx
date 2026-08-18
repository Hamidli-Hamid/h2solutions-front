"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { CheckIcon, ChevronDownIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

import {
  i18n,
  isLocale,
  localeNames,
  localeShortLabels,
  type Locale,
} from "@/i18n-config";

type Props = {
  current: Locale;
  /** Accessible name for the control, e.g. dict.nav.language. */
  label: string;
};

function persistLocaleCookie(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

/**
 * A `<details>` disclosure holding one real `<a href>` per language.
 *
 * The previous version was a `<select>` that called `router.push`, which meant
 * the six language trees were connected by nothing a crawler could follow:
 * hreflang annotations tell Google the translations *exist*, but only links
 * pass authority between them, and Google's own multilingual guidance asks for
 * links rather than script-driven switching. Rendered this way the alternates
 * are in the served HTML of every page, and the control still works with
 * JavaScript off.
 */
export function LanguageSwitcher({ current, label }: Props) {
  const details = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname() ?? `/${current}`;

  /** The current route under another language prefix. */
  function pathFor(locale: Locale) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && isLocale(segments[0])) {
      segments[0] = locale;
    } else {
      segments.unshift(locale);
    }
    return "/" + segments.join("/");
  }

  return (
    <details
      ref={details}
      className="group relative inline-block text-xs"
      /* A disclosure stays open until something closes it: leaving it entirely
         (click elsewhere, Tab past the last language) should. */
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          event.currentTarget.open = false;
        }
      }}
    >
      <summary
        aria-label={label}
        className="flex cursor-pointer list-none items-center gap-1.5 rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-background-elevated)] px-2.5 py-2 font-semibold tracking-wider text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-accent)]/60 focus-visible:border-[color:var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/40 [&::-webkit-details-marker]:hidden"
      >
        <GlobeAltIcon aria-hidden className="h-4 w-4 text-[color:var(--color-accent)]" />
        {localeShortLabels[current]}
        <ChevronDownIcon
          aria-hidden
          className="h-3.5 w-3.5 text-[color:var(--color-foreground-muted)] transition group-open:rotate-180"
        />
      </summary>

      <ul
        className="absolute right-0 z-40 mt-2 min-w-[11rem] overflow-hidden rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-background-elevated)] py-1 shadow-lg"
      >
        {i18n.locales.map((locale) => {
          const isCurrent = locale === current;

          return (
            <li key={locale}>
              <Link
                href={pathFor(locale)}
                hrefLang={locale}
                lang={locale}
                aria-current={isCurrent ? "true" : undefined}
                onClick={() => {
                  persistLocaleCookie(locale);
                  if (details.current) details.current.open = false;
                }}
                className={`flex items-center justify-between gap-3 px-3 py-2 text-[0.8125rem] transition hover:bg-[color:var(--color-background)] ${
                  isCurrent
                    ? "font-semibold text-[color:var(--color-accent)]"
                    : "text-[color:var(--color-foreground-soft)]"
                }`}
              >
                <span>{localeNames[locale]}</span>
                {isCurrent ? (
                  <CheckIcon aria-hidden className="h-3.5 w-3.5" />
                ) : (
                  <span aria-hidden className="font-semibold tracking-wider opacity-60">
                    {localeShortLabels[locale]}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
