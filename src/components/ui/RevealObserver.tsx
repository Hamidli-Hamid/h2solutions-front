"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll-reveal fallback for browsers without scroll-driven animations.
 *
 * The reveals themselves are CSS: `.reveal`, `.reveal-item`, `.word-reveal`
 * and `.line-grow` animate on `animation-timeline: view()` with no script at
 * all. Where that timeline is unsupported (Firefox at the time of writing)
 * they used to show at once, which is why the page "opened flat" there.
 * This component steps in only in that case: it flags `<html>` with
 * `js-reveal`, which arms the transition-based fallback rules in
 * `globals.css`, and adds `in-view` to each element the first time it
 * scrolls into the viewport. Elements already in view on load resolve in the
 * observer's first callback, so nothing above the fold waits.
 *
 * Nothing is hidden until this has run — the fallback rules are scoped to
 * `html.js-reveal` — so a visitor without JavaScript sees everything, and a
 * visitor who asked for less motion is left alone entirely. It re-runs on
 * every route change so the new page's elements are observed too.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("js-reveal");

    const targets = document.querySelectorAll<HTMLElement>(
      ".reveal, .reveal-item, .word-reveal, .line-grow",
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      },
      /* The root is stretched a long way upward, so an element the visitor
         jumped past — an anchor link, a restored scroll position, a flick
         on a trackpad — counts as intersecting and is marked at once. It is
         off-screen when that happens, so there is nothing to see, and when
         they scroll back up it is simply there, as it would have been had
         they scrolled through. Only the bottom edge is pulled in, so a
         reveal starts a little inside the viewport rather than on its rim. */
      { rootMargin: "20000px 0px -8% 0px", threshold: 0.01 },
    );

    targets.forEach((target) => {
      if (!target.classList.contains("in-view")) observer.observe(target);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
