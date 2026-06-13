"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { i18n, isLocale, localeNames, localeShortLabels, type Locale } from "@/i18n-config";

type Props = {
  current: Locale;
};

function persistLocaleCookie(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function LanguageSwitcher({ current }: Props) {
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
    <div
      role="group"
      aria-label="Language"
      className="flex items-center gap-1 rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-background-elevated)] p-1 text-xs"
    >
      {i18n.locales.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => switchTo(locale)}
            aria-pressed={active}
            aria-label={localeNames[locale]}
            lang={locale}
            disabled={isPending}
            className={`rounded px-2 py-1 font-semibold tracking-wider transition ${
              active
                ? "bg-[color:var(--color-accent)] text-[#001019]"
                : "text-[color:var(--color-foreground-muted)] hover:text-[color:var(--color-foreground)]"
            }`}
          >
            {localeShortLabels[locale]}
          </button>
        );
      })}
    </div>
  );
}
