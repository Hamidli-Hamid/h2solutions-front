"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type Props = {
  images: string[];
  title: string;
  labels: {
    heading: string;
    hint: string;
    close: string;
  };
};

/**
 * Every image is shown at once as an even tile grid; selecting one opens it
 * full size in a native <dialog>, which gives us Esc, focus trapping and the
 * backdrop for free — no lightbox dependency.
 */
export function ProjectGallery({ images, title, labels }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const move = useCallback(
    (delta: number) =>
      setOpenIndex((current) =>
        current === null
          ? current
          : (current + delta + images.length) % images.length,
      ),
    [images.length],
  );

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
    if (openIndex === null || images.length < 2) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openIndex, images.length, move]);

  if (images.length === 0) return null;

  /* At most four tiles sit beside the cover; anything further is reachable
     through the "+N" badge on the last one, which keeps the mosaic tidy for
     any number of uploads. */
  const visible = images.slice(1, 5);
  const hiddenCount = images.length - 1 - visible.length;
  /* A 2×2 block of 16:10 tiles is almost exactly as tall as a single 16:10
     cover of double the width, so both columns line up without stretching
     — which is what kept distorting the cover. */
  const tileGrid = visible.length === 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <section aria-labelledby="gallery-heading" className="reveal">
      <div className="container-h2 py-12 md:py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-3">
          <h2 id="gallery-heading" className="text-2xl font-bold md:text-[1.75rem]">
            {labels.heading}
          </h2>
          <p className="text-xs text-[color:var(--color-foreground-muted)]">
            {labels.hint}
          </p>
        </div>

        {/* Mosaic: the cover (first image) leads at full height on the left,
            the remaining shots sit beside it as a tile grid. */}
        <div className="mt-6 grid items-start gap-4 lg:grid-cols-2">
          <Tile
            image={images[0]}
            index={0}
            total={images.length}
            title={title}
            onOpen={setOpenIndex}
            className="aspect-16/10"
            sizes="(min-width: 1024px) 50vw, 100vw"
            eager
          />

          {visible.length > 0 && (
            <ul className={`grid gap-4 ${tileGrid}`}>
              {visible.map((image, index) => (
                <li key={image} className="flex">
                  <Tile
                    image={image}
                    index={index + 1}
                    total={images.length}
                    title={title}
                    onOpen={setOpenIndex}
                    className="aspect-16/10"
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    eager={index < 3}
                    overlayCount={
                      hiddenCount > 0 && index === visible.length - 1
                        ? hiddenCount
                        : 0
                    }
                    /* The badge tile jumps straight to the first hidden shot. */
                    openAt={
                      hiddenCount > 0 && index === visible.length - 1
                        ? visible.length + 1
                        : undefined
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setOpenIndex(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpenIndex(null);
        }}
        aria-label={labels.heading}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-[#04070d]/85 backdrop:backdrop-blur-sm"
      >
        {openIndex !== null && (
          <div className="relative flex h-dvh w-screen items-center justify-center p-4 md:p-10">
            <div className="relative max-h-full w-full max-w-6xl">
              <Image
                key={images[openIndex]}
                src={images[openIndex]}
                alt={`${title} — ${openIndex + 1}`}
                width={1920}
                height={1200}
                sizes="100vw"
                className="mx-auto h-auto max-h-[82dvh] w-auto max-w-full rounded-xl border border-[color:var(--color-border-strong)] object-contain"
              />
            </div>

            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              aria-label={labels.close}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)]/80 text-[color:var(--color-foreground)] backdrop-blur transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] md:right-8 md:top-8"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            {images.length > 1 && (
              <>
                <LightboxArrow side="left" label={labels.hint} onClick={() => move(-1)}>
                  <ChevronLeftIcon className="h-5 w-5" />
                </LightboxArrow>
                <LightboxArrow side="right" label={labels.hint} onClick={() => move(1)}>
                  <ChevronRightIcon className="h-5 w-5" />
                </LightboxArrow>
                <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)]/80 px-3 py-1 text-xs text-[color:var(--color-foreground-soft)] backdrop-blur">
                  {openIndex + 1} / {images.length}
                </p>
              </>
            )}
          </div>
        )}
      </dialog>
    </section>
  );
}

function Tile({
  image,
  index,
  total,
  title,
  onOpen,
  className,
  sizes,
  eager = false,
  overlayCount = 0,
  openAt,
}: {
  image: string;
  index: number;
  total: number;
  title: string;
  onOpen: (index: number) => void;
  className: string;
  sizes: string;
  eager?: boolean;
  /** Renders a persistent "+N" badge for the images not shown as tiles. */
  overlayCount?: number;
  openAt?: number;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(openAt ?? index)}
      aria-label={`${title} — ${index + 1}/${total}`}
      className={`panel panel-interactive group relative block w-full overflow-hidden p-0 ${className}`}
    >
      <Image
        src={image}
        alt={`${title} — ${index + 1}`}
        fill
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        className="object-cover transition duration-500 group-hover:scale-[1.04]"
      />
      {overlayCount > 0 ? (
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center bg-[color:var(--color-background)]/70 text-lg font-semibold text-[color:var(--color-foreground)] backdrop-blur-[2px] transition group-hover:text-[color:var(--color-accent)]"
        >
          +{overlayCount}
        </span>
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center bg-[color:var(--color-background)]/55 opacity-0 backdrop-blur-[1px] transition group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <span className="icon-tile h-10 w-10">
            <MagnifyingGlassPlusIcon className="h-5 w-5" />
          </span>
        </span>
      )}
    </button>
  );
}

function LightboxArrow({
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
      className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)]/80 text-[color:var(--color-foreground)] backdrop-blur transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] ${
        side === "left" ? "left-3 md:left-8" : "right-3 md:right-8"
      }`}
    >
      {children}
    </button>
  );
}
