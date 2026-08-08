"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavItem } from "@/lib/site-config";
import type { Locale } from "@/i18n-config";

type Props = {
  lang: Locale;
  /** Menu as managed in the admin — see resolveNav(). */
  items: NavItem[];
};

export function NavLinks({ lang, items }: Props) {
  const pathname = usePathname() ?? `/${lang}`;
  const home = `/${lang}`;

  return (
    <>
      {items.map((item) => {
        const active =
          item.external || item.href === home
            ? pathname === item.href || pathname === `${item.href}/`
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.key}
            href={item.href}
            {...(item.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            aria-current={active ? "page" : undefined}
            className={`relative rounded-md px-3 py-2 text-sm transition ${
              active
                ? "text-[color:var(--color-foreground)]"
                : "text-[color:var(--color-foreground-soft)] hover:text-[color:var(--color-foreground)]"
            }`}
          >
            {item.label}
            {active && (
              <span
                aria-hidden
                className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[color:var(--color-accent)] shadow-[var(--shadow-glow)]"
              />
            )}
          </Link>
        );
      })}
    </>
  );
}
