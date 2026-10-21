"use client";

import { useEffect } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

import { THEME_STORAGE_KEY } from "./ThemeScript";

type Props = {
  labels: {
    /** Name of the control itself, e.g. "Tema". */
    theme: string;
    /** What the button switches *to*, per theme. */
    light: string;
    dark: string;
  };
  className?: string;
};

/** Keeps the browser-UI colour in step with the active theme. */
function syncThemeColorMeta() {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  /* Read the token back off the root rather than repeating the two hex
     values here — globals.css stays the only place a theme colour is set. */
  const background = getComputedStyle(document.documentElement)
    .getPropertyValue("--h2-bg")
    .trim();
  if (background) meta.setAttribute("content", background);
}

/**
 * Light/dark switch.
 *
 * Deliberately stateless: the current theme lives in `data-theme` on <html>,
 * written by `ThemeScript` before paint, and the two faces of the button are
 * swapped by CSS attribute selectors. A React state holding the theme would
 * have to guess on the server — the server has no idea which theme this
 * visitor uses — and every guess that came out wrong would be a hydration
 * mismatch. This way the markup is identical on both sides.
 *
 * Only the visible face contributes to the accessible name, because
 * `display: none` content is excluded from the name computation. So the
 * button announces the theme it will switch to, which is the useful half.
 */
export function ThemeToggle({ labels, className }: Props) {
  useEffect(syncThemeColorMeta, []);

  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";

    const apply = () => {
      root.dataset.theme = next;
      syncThemeColorMeta();
    };

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* Private mode or blocked storage: the switch still works, it just
         will not survive a reload. */
    }

    /* A free cross-fade where the browser has one, an instant swap where it
       does not — and never for a visitor who asked for less motion. */
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && typeof document.startViewTransition === "function") {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={labels.theme}
      className={`inline-flex h-9.5 w-9.5 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-background-elevated)] text-[color:var(--color-foreground-soft)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] ${className ?? ""}`}
    >
      <span className="theme-when-light items-center">
        <MoonIcon aria-hidden className="h-4.5 w-4.5" />
        <span className="sr-only">{labels.dark}</span>
      </span>
      <span className="theme-when-dark items-center">
        <SunIcon aria-hidden className="h-4.5 w-4.5" />
        <span className="sr-only">{labels.light}</span>
      </span>
    </button>
  );
}
