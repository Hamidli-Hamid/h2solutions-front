"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import type { NavItem } from "@/lib/site-config";

type Props = {
  items: NavItem[];
  labels: Record<string, string>;
  ctaLabel: string;
  ctaHref: string;
  /** When set, the button opens this WhatsApp chat instead of the contact page. */
  chat?: { number: string; message: string } | null;
};

export function MobileMenu({ items, labels, ctaLabel, ctaHref, chat }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    // Esc closes the panel, as every overlay on the site does.
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
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
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] xl:hidden"
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

      {/* Full-height sheet with an explicit height: the sticky header has a
          backdrop-filter, which makes it the containing block of this fixed
          panel, so `bottom-0` would resolve against the 4rem header. */}
      {open && (
        <div
          id="mobile-menu"
          className="menu-in fixed inset-x-0 top-16 z-40 h-[calc(100dvh-4rem)] origin-top overflow-y-auto overscroll-contain border-t border-[color:var(--color-border)] bg-[color:var(--color-background)] md:top-18 md:h-[calc(100dvh-4.5rem)] xl:hidden"
        >
          <nav aria-label={labels.menu} className="container-h2 flex flex-col gap-1 py-4">
            {items.map((item) => {
              const active = !item.external && pathname === item.href;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  {...(item.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  aria-current={active ? "page" : undefined}
                  onClick={close}
                  className={`flex min-h-12 items-center rounded-md px-3 font-[family-name:var(--font-display)] text-lg transition-colors hover:bg-[color:var(--color-background-elevated)] hover:text-[color:var(--color-foreground)] ${
                    active
                      ? "bg-[color:var(--color-background-elevated)] text-[color:var(--color-foreground)]"
                      : "text-[color:var(--color-foreground-soft)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {chat ? (
              <WhatsAppLink
                number={chat.number}
                message={chat.message}
                onClick={close}
                className="btn-primary mt-3 justify-center"
              >
                {ctaLabel}
              </WhatsAppLink>
            ) : (
              <Link
                href={ctaHref}
                onClick={close}
                className="btn-primary mt-3 justify-center"
              >
                {ctaLabel}
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
