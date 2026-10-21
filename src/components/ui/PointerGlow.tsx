"use client";

import { useEffect } from "react";

type Sample = { el: HTMLElement; x: number; y: number };

/**
 * Pointer effects driver — one delegated listener for three CSS hooks.
 *
 * - `[data-glow]`: the cursor position inside the hovered card is written to
 *   `--gx`/`--gy` (percentages), which `.glow-card` reads to place its radial
 *   highlight.
 * - `[data-spotlight]`: the position inside the section is written to
 *   `--mx`/`--my` (pixels) and the section is flagged `data-spot-active` while
 *   the pointer is inside it, which fades the `.spotlight` field in.
 * - `[data-magnetic]`: the control is pulled a few pixels toward the cursor
 *   with an inline transform, which is cleared when the cursor leaves so the
 *   CSS transition springs it back.
 *
 * Reads are batched into one animation frame, so a fast cursor cannot force a
 * layout per event. Everything degrades: without JavaScript, on touch, or for
 * a keyboard user the custom properties keep their CSS fallbacks, the
 * spotlight stays off and the controls stay put. The magnetic pull is also
 * skipped for a visitor who asked for less motion.
 */
export function PointerGlow() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    let glow: Sample | null = null;
    let spot: Sample | null = null;
    let magnet: Sample | null = null;
    let activeSpot: HTMLElement | null = null;
    let activeMagnet: HTMLElement | null = null;

    const apply = () => {
      frame = 0;

      if (glow) {
        const { el, x, y } = glow;
        glow = null;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--gx", `${((x - rect.left) / rect.width) * 100}%`);
        el.style.setProperty("--gy", `${((y - rect.top) / rect.height) * 100}%`);
      }

      if (spot) {
        const { el, x, y } = spot;
        spot = null;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${x - rect.left}px`);
        el.style.setProperty("--my", `${y - rect.top}px`);
      }

      if (magnet) {
        const { el, x, y } = magnet;
        magnet = null;
        const rect = el.getBoundingClientRect();
        /* Up to 6px sideways and 4px vertically, scaled by how far from the
           centre the cursor sits; the -2px keeps the CSS hover lift. */
        const dx = ((x - (rect.left + rect.width / 2)) / (rect.width / 2)) * 6;
        const dy = ((y - (rect.top + rect.height / 2)) / (rect.height / 2)) * 4 - 2;
        el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      }
    };

    const onMove = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const { clientX: x, clientY: y } = event;

      const glowEl = target?.closest?.<HTMLElement>("[data-glow]") ?? null;
      if (glowEl) glow = { el: glowEl, x, y };

      const spotEl = target?.closest?.<HTMLElement>("[data-spotlight]") ?? null;
      if (spotEl !== activeSpot) {
        activeSpot?.removeAttribute("data-spot-active");
        activeSpot = spotEl;
        spotEl?.setAttribute("data-spot-active", "");
      }
      if (spotEl) spot = { el: spotEl, x, y };

      if (!reducedMotion) {
        const magnetEl = target?.closest?.<HTMLElement>("[data-magnetic]") ?? null;
        if (magnetEl !== activeMagnet) {
          if (activeMagnet) activeMagnet.style.transform = "";
          activeMagnet = magnetEl;
        }
        if (magnetEl) magnet = { el: magnetEl, x, y };
      }

      frame ||= requestAnimationFrame(apply);
    };

    /* Leaving the window entirely never fires a move over another element,
       so the active states are cleared here instead. */
    const onLeave = () => {
      activeSpot?.removeAttribute("data-spot-active");
      activeSpot = null;
      if (activeMagnet) activeMagnet.style.transform = "";
      activeMagnet = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      onLeave();
    };
  }, []);

  return null;
}
