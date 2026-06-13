"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navItems } from "@/lib/site-config";
import type { Locale } from "@/i18n-config";

type Props = {
  lang: Locale;
  labels: Record<string, string>;
  ctaLabel: string;
  ctaHref: string;
};

export function MobileMenu({ lang, labels, ctaLabel, ctaHref }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        aria-label={open ? labels.close : labels.menu}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] md:hidden"
      >
        <span className="sr-only">{open ? labels.close : labels.menu}</span>
        <div aria-hidden className="flex flex-col gap-1.5">
          <span
            className={`block h-0.5 w-5 bg-current transition ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-current transition ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-current transition ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </div>
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-16 z-40 origin-top border-t border-[color:var(--color-border)] bg-[color:var(--color-background)]/95 backdrop-blur md:hidden"
        >
          <nav aria-label={labels.menu} className="container-h2 flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href(lang)}
                onClick={close}
                className="rounded-md px-3 py-3 text-base text-[color:var(--color-foreground-soft)] hover:bg-[color:var(--color-background-elevated)] hover:text-[color:var(--color-foreground)]"
              >
                {labels[item.key]}
              </Link>
            ))}
            <Link
              href={ctaHref}
              onClick={close}
              className="btn-primary mt-3 justify-center"
            >
              {ctaLabel}
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
