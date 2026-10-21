"use client";

import Image from "next/image";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";

import {
  GalleryViewer,
  pad,
  useGalleryViewer,
  type GalleryViewerLabels,
} from "@/components/ui/GalleryViewer";
import type { ViewerShots } from "@/lib/project-shots";

type Props = {
  images: string[];
  title: string;
  labels: GalleryViewerLabels;
  shots?: ViewerShots;
};

/* Desktop bento, one layout per image count: the lead shot always takes two
   rows, and the rows under it alternate wide/narrow so no two rows mirror
   each other. Beyond six the last tile carries a "+N" badge — the viewer
   still pages through every image. */
const LAYOUTS: Record<number, string[]> = {
  1: ["md:col-span-12 md:row-span-2"],
  2: ["md:col-span-7 md:row-span-2", "md:col-span-5 md:row-span-2"],
  3: ["md:col-span-7 md:row-span-2", "md:col-span-5", "md:col-span-5"],
  4: ["md:col-span-5 md:row-span-2", "md:col-span-7", "md:col-span-4", "md:col-span-3"],
  5: ["md:col-span-7 md:row-span-2", "md:col-span-5", "md:col-span-5", "md:col-span-5", "md:col-span-7"],
  6: ["md:col-span-7 md:row-span-2", "md:col-span-5", "md:col-span-5", "md:col-span-4", "md:col-span-3", "md:col-span-5"],
};

/**
 * The case-study gallery that opens the project page: every shot at once in an
 * asymmetric bento across the full width, and the full-screen viewer behind
 * any tile.
 */
export function ProjectGallery({ images, title, labels, shots }: Props) {
  const total = images.length;
  const viewer = useGalleryViewer(total);

  const shown = images.slice(0, 6);
  const layout = LAYOUTS[shown.length] ?? LAYOUTS[6];
  const hiddenCount = total - shown.length;
  /* Phones: the lead shot spans both columns, the rest pair up, and an odd
     one out takes the full row instead of leaving a hole. */
  const restOdd = (shown.length - 1) % 2 === 1;

  if (total === 0) return null;

  return (
    <section aria-labelledby="gallery-heading">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 id="gallery-heading" className="section-label">
          {labels.heading}
        </h2>
        <p className="text-xs text-[color:var(--color-foreground-muted)]">
          <span className="font-[family-name:var(--font-display)] font-semibold tabular-nums text-[color:var(--color-accent)]">
            {pad(total)}
          </span>
          <span className="hidden sm:inline"> · {labels.hint}</span>
        </p>
      </div>

      <ul className="project-bento grid grid-cols-2 gap-2.5 md:grid-cols-12 md:gap-3.5">
        {shown.map((image, index) => {
          const isLead = index === 0;
          const isLast = index === shown.length - 1;
          const badge = isLast && hiddenCount > 0 ? hiddenCount : 0;
          const mobile = isLead
            ? "col-span-2 row-span-2"
            : isLast && restOdd
              ? "col-span-2"
              : "";
          return (
            <li
              key={image}
              className={`rise flex ${mobile} ${layout[index]}`}
              style={{ "--d": `${80 + index * 70}ms` } as React.CSSProperties}
            >
              <button
                type="button"
                onClick={() => viewer.show(index)}
                aria-label={`${title} — ${index + 1}/${total}`}
                className="bento-tile group relative block w-full overflow-hidden"
              >
                <Image
                  src={image}
                  alt={`${title} — ${index + 1}`}
                  fill
                  sizes={isLead ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 768px) 42vw, 50vw"}
                  priority={isLead}
                  className="object-cover object-top transition duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.045]"
                />
                <span aria-hidden className="bento-shade" />
                <span
                  aria-hidden
                  className="gallery-glass absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 font-[family-name:var(--font-display)] text-[0.625rem] font-semibold tabular-nums tracking-wider text-[color:var(--color-foreground-soft)] md:left-3.5 md:top-3.5"
                >
                  {pad(index + 1)}
                </span>
                {badge > 0 ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center bg-[color:var(--color-background)]/65 font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--color-foreground)] backdrop-blur-[2px]"
                  >
                    +{badge}
                  </span>
                ) : (
                  <span
                    aria-hidden
                    className="gallery-glass absolute bottom-2.5 right-2.5 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full text-[color:var(--color-foreground)] opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 md:bottom-3.5 md:right-3.5"
                  >
                    <ArrowsPointingOutIcon className="h-4 w-4" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <GalleryViewer images={images} title={title} labels={labels} viewer={viewer} shots={shots} />
    </section>
  );
}
