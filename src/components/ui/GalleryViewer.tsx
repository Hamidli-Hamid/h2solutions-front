"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

import type { ViewerShot, ViewerShots } from "@/lib/project-shots";

export type GalleryViewerLabels = {
  heading: string;
  hint: string;
  close: string;
  prev: string;
  next: string;
};

type Props = {
  images: string[];
  title: string;
  labels: GalleryViewerLabels;
  viewer: GalleryViewerState;
  /** Plain desktop/mobile screenshots per image, when the admin has them. */
  shots?: ViewerShots;
};

export type GalleryViewerState = ReturnType<typeof useGalleryViewer>;

export const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Which image the viewer shows, and from which side it slid in. Lives in the
 * grid that owns the tiles, so any tile can call `show(index)`; the viewer
 * itself only renders it.
 */
export function useGalleryViewer(total: number) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);

  const show = useCallback(
    (index: number, dir = 1) => {
      setDirection(dir);
      setOpenIndex(((index % total) + total) % total);
    },
    [total],
  );

  const step = useCallback(
    (delta: number) => {
      if (openIndex !== null) show(openIndex + delta, delta);
    },
    [openIndex, show],
  );

  const close = useCallback(() => setOpenIndex(null), []);

  return { openIndex, direction, show, step, close, total };
}

/**
 * The full-screen viewer behind a gallery. A native <dialog>, so Esc, the
 * focus trap and the backdrop come with the platform.
 *
 * A page that has its plain screenshots is shown as the two devices: side by
 * side on a wide screen, the desktop above the phone on a narrow one, in a
 * column that scrolls. There is no zoom of its own — the browser's (pinch on
 * a phone, Ctrl/⌘ + on a computer) goes as far as the reader wants, and the
 * files are the originals, so the detail is there to find. A page without
 * screenshots shows its composed picture.
 */
export function GalleryViewer({ images, title, labels, viewer, shots }: Props) {
  const { openIndex, direction, show, close, total } = viewer;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stripRef = useRef<HTMLUListElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  /* ---- paging without a blank frame -------------------------------- */
  /* The shots are full-size originals. Fetched only when a page is shown,
     each switch showed the new page half-drawn for a few hundred ms. So the
     neighbours are fetched and decoded ahead, and a switch waits (capped)
     until its page is ready — the old page stays on screen meanwhile. */
  const decoded = useRef(new Map<string, Promise<void>>());
  const target = useRef<number | null>(null);

  const urlsAt = useCallback(
    (index: number): string[] => {
      const picture = images[index];
      const pair = picture ? shots?.[picture] : undefined;
      if (pair?.desktop && pair.mobile) return [pair.desktop, pair.mobile];
      return picture ? [picture] : [];
    },
    [images, shots],
  );

  const ready = useCallback(
    (index: number) =>
      Promise.all(
        urlsAt(index).map((url) => {
          let done = decoded.current.get(url);
          if (!done) {
            const img = new window.Image();
            img.src = url;
            done = img.decode().catch(() => undefined);
            decoded.current.set(url, done);
          }
          return done;
        }),
      ),
    [urlsAt],
  );

  const wrap = useCallback((index: number) => ((index % total) + total) % total, [total]);

  /** Show page `index` once its images are decoded (or after 1.5 s at most). */
  const go = useCallback(
    (index: number, dir: number) => {
      const next = wrap(index);
      target.current = next;
      const cap = new Promise((resolve) => window.setTimeout(resolve, 1500));
      void Promise.race([ready(next), cap]).then(() => {
        // A later press wins: only the last requested page is shown.
        if (target.current === next) {
          target.current = null;
          show(next, dir);
        }
      });
    },
    [ready, show, wrap],
  );

  /** Relative paging counts from a switch still in flight, so two quick
      presses move two pages. */
  const goBy = useCallback(
    (delta: number) => {
      const from = target.current ?? openIndex;
      if (from !== null) go(from + delta, delta);
    },
    [go, openIndex],
  );

  /* Warm the pages either side of the one on screen. */
  useEffect(() => {
    if (openIndex === null) return;
    for (const delta of [0, 1, -1, 2]) void ready(wrap(openIndex + delta));
  }, [openIndex, ready, wrap]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (openIndex !== null && !dialog.open) dialog.showModal();
    if (openIndex === null && dialog.open) dialog.close();

    document.body.style.overflow = openIndex !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openIndex]);

  useEffect(() => {
    if (openIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight" && total > 1) {
        event.preventDefault();
        goBy(1);
      } else if (event.key === "ArrowLeft" && total > 1) {
        event.preventDefault();
        goBy(-1);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openIndex, total, goBy]);

  /* A new page starts at its top, not where the last one was scrolled to. */
  useEffect(() => {
    stageRef.current?.scrollTo({ top: 0 });
  }, [openIndex]);

  /* Keep the active thumbnail inside the viewer's filmstrip. Done by hand,
     not scrollIntoView, which would also try to scroll the page. */
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = openIndex !== null ? (strip?.children[openIndex] as HTMLElement | undefined) : undefined;
    if (!strip || !thumb) return;
    const left = thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2;
    strip.scrollTo({ left, behavior: "smooth" });
  }, [openIndex]);

  const image = openIndex !== null ? images[openIndex] : null;
  const shot: ViewerShot | undefined = image ? shots?.[image] : undefined;
  const desktop = shot?.desktop;
  const mobile = shot?.mobile;
  const caption = shot?.alt ?? title;

  return (
    <dialog
      ref={dialogRef}
      onClose={close}
      aria-label={labels.heading}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-[color:var(--h2-scrim)] backdrop:backdrop-blur-md"
    >
      {openIndex !== null && image && (
        <div className="flex h-full w-full flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-3 px-3 pt-3 md:px-8 md:pt-6">
            <p className="min-w-0 truncate text-sm text-[color:var(--color-foreground-soft)]">
              <span className="font-[family-name:var(--font-display)] font-semibold tabular-nums text-[color:var(--color-accent)]">
                {pad(openIndex + 1)}
              </span>
              <span className="tabular-nums text-[color:var(--color-foreground-muted)]"> / {pad(total)}</span>
              <span className="ml-3">{caption}</span>
            </p>
            <div className="flex flex-none items-center gap-2">
              {/* On a phone the arrows live up here, clear of the screenshots. */}
              {total > 1 && (
                <>
                  <ViewerButton label={labels.prev} onClick={() => goBy(-1)} className="sm:hidden">
                    <ChevronLeftIcon className="h-5 w-5" />
                  </ViewerButton>
                  <ViewerButton label={labels.next} onClick={() => goBy(1)} className="sm:hidden">
                    <ChevronRightIcon className="h-5 w-5" />
                  </ViewerButton>
                </>
              )}
              <ViewerButton label={labels.close} onClick={close}>
                <XMarkIcon className="h-5 w-5" />
              </ViewerButton>
            </div>
          </div>

          {/* Stage */}
          <div
            ref={stageRef}
            className="viewer-stage relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-20 lg:overflow-hidden lg:px-24"
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div
              key={image}
              className="viewer-slide flex min-h-full flex-col items-center justify-center gap-5 lg:h-full lg:flex-row lg:gap-8"
              style={{ "--dir": direction } as React.CSSProperties}
              onClick={(event) => {
                if (event.target === event.currentTarget) close();
              }}
            >
              {desktop && mobile ? (
                <>
                  <figure className="viewer-browser">
                    <span aria-hidden className="viewer-browser__bar">
                      <i />
                      <i />
                      <i />
                    </span>
                    {/* Plain <img>: the original file, at whatever size the
                        reader zooms to — an optimised copy would cap it. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={desktop} alt={`${caption} — desktop`} draggable={false} />
                  </figure>
                  <figure className="viewer-phone">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mobile} alt={`${caption} — mobile`} draggable={false} />
                  </figure>
                </>
              ) : (
                <div className="overflow-hidden rounded-xl border border-[color:var(--color-border-strong)] shadow-[var(--h2-panel-shadow)]">
                  <Image
                    src={image}
                    alt={`${caption} — ${openIndex + 1}`}
                    width={1920}
                    height={1200}
                    unoptimized
                    loading="eager"
                    draggable={false}
                    className="block h-auto max-h-[calc(100dvh-11rem)] w-auto max-w-full md:max-h-[calc(100dvh-13rem)]"
                  />
                </div>
              )}
            </div>

            {total > 1 && (
              <>
                <ViewerArrow side="left" label={labels.prev} onClick={() => goBy(-1)}>
                  <ChevronLeftIcon className="h-5 w-5" />
                </ViewerArrow>
                <ViewerArrow side="right" label={labels.next} onClick={() => goBy(1)}>
                  <ChevronRightIcon className="h-5 w-5" />
                </ViewerArrow>
              </>
            )}
          </div>

          {/* Filmstrip */}
          {total > 1 && (
            <ul
              ref={stripRef}
              className="viewer-strip mx-auto flex max-w-full gap-2 overflow-x-auto px-3 pb-4 pt-2 md:gap-2.5 md:px-8 md:pb-7"
            >
              {images.map((thumb, index) => (
                <li key={thumb} className="flex-none">
                  <button
                    type="button"
                    onClick={() => go(index, index >= openIndex ? 1 : -1)}
                    aria-label={`${shots?.[thumb]?.alt ?? title} — ${index + 1}/${total}`}
                    aria-current={index === openIndex ? "true" : undefined}
                    className="gallery-thumb relative block aspect-16/10 w-16 overflow-hidden md:w-24"
                  >
                    <Image src={thumb} alt="" fill sizes="96px" className="object-cover object-top" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </dialog>
  );
}

function ViewerButton({
  label,
  onClick,
  className = "",
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`gallery-glass flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--color-foreground)] transition hover:text-[color:var(--color-accent)] ${className}`}
    >
      {children}
    </button>
  );
}

function ViewerArrow({
  side,
  label,
  onClick,
  children,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`gallery-glass fixed top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-[color:var(--color-foreground)] transition hover:text-[color:var(--color-accent)] sm:flex ${
        side === "left" ? "left-3 md:left-8" : "right-3 md:right-8"
      }`}
    >
      {children}
    </button>
  );
}
