"use client";

import { ChevronDownIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
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
 * Native <select> so the language list stays compact at five locales and gets
 * the platform picker on mobile. The select sits transparent on top of the
 * styled trigger below it — that way the closed state can show the short code
 * while the list itself shows every language in its own script.
 */
export function LanguageSwitcher({ current, label }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? `/${current}`;
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === current) return;

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && isLocale(segments[0])) {
      segments[0] = next;
    } else {
      segments.unshift(next);
    }
    const nextPath = "/" + segments.join("/");

    persistLocaleCookie(next);

    startTransition(() => {
      router.push(nextPath);
      router.refresh();
    });
  }

  return (
    <div className="relative inline-flex items-center rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-background-elevated)] text-xs transition has-[select:focus-visible]:border-[color:var(--color-accent)] has-[select:focus-visible]:ring-2 has-[select:focus-visible]:ring-[color:var(--color-accent)]/40 has-[select:hover]:border-[color:var(--color-accent)]/60">
      <span
        aria-hidden
        className={`pointer-events-none flex items-center gap-1.5 px-2.5 py-2 font-semibold tracking-wider ${
          isPending
            ? "text-[color:var(--color-foreground-muted)]"
            : "text-[color:var(--color-foreground)]"
        }`}
      >
        <GlobeAltIcon className="h-4 w-4 text-[color:var(--color-accent)]" />
        {localeShortLabels[current]}
        <ChevronDownIcon className="h-3.5 w-3.5 text-[color:var(--color-foreground-muted)]" />
      </span>

      <select
        aria-label={label}
        value={current}
        disabled={isPending}
        onChange={(event) => {
          const next = event.target.value;
          if (isLocale(next)) switchTo(next);
        }}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none border-0 bg-transparent text-transparent opacity-0 disabled:cursor-wait"
      >
        {i18n.locales.map((locale) => (
          <option key={locale} value={locale} lang={locale}>
            {localeShortLabels[locale]} — {localeNames[locale]}
          </option>
        ))}
      </select>
    </div>
  );
}
