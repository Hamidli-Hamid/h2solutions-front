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

/** Thumbnails beside the lead shot; the last one carries "+N" beyond that. */
const THUMBS = 3;

/**
 * Grid per thumbnail count. The lead shot is the picture that sells the case,
 * so it takes three of four columns at 16:10 and its height sets the grid; the
 * thumbnails stack in the fourth column, three rows to its height — each lands
 * near 16:10 too. With fewer thumbnails the last one spans the rows left over.
 */
const LAYOUTS: Record<number, { columns: number; lead: string; last?: string }> = {
  1: { columns: 4, lead: "col-span-3 row-span-3", last: "row-span-3" },
  2: { columns: 4, lead: "col-span-3 row-span-3", last: "row-span-2" },
  3: { columns: 4, lead: "col-span-3 row-span-3" },
};

/**
 * The right-hand side of a homepage timeline entry: the lead shot with the
 * other shots as thumbnails to its right. The shots are composed 16:10
 * mock-ups, so the tiles keep that ratio instead of cropping into a bento —
 * a cropped mock-up loses the device frames that make it read. Any tile opens
 * the full-screen viewer at that image, which still pages through all of them.
 */
export function ProjectTimelineGallery({ images, title, labels, shots }: Props) {
  const total = images.length;
  const viewer = useGalleryViewer(total);

  if (total === 0) return null;

  const [lead, ...rest] = images;
  const thumbs = rest.slice(0, THUMBS);
  const hiddenCount = rest.length - thumbs.length;
  const layout = LAYOUTS[thumbs.length] ?? { columns: 1, lead: "" };

  return (
    <div>
      <ul
        className="grid gap-2 md:gap-3"
        style={{
          gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
          gridTemplateRows: thumbs.length > 0 ? "repeat(3, minmax(0, 1fr))" : undefined,
        }}
      >
        <li className={layout.lead}>
          <button
            type="button"
            onClick={() => viewer.show(0)}
            aria-label={`${title} — 1/${total}`}
            className="bento-tile group relative block aspect-16/10 w-full overflow-hidden"
          >
            <Image
              src={lead}
              alt={`${title} — 1`}
              fill
              sizes="(min-width: 1536px) 44rem, (min-width: 1024px) 46vw, 75vw"
              className="object-cover object-top transition duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
            />
            <span aria-hidden className="bento-shade" />
            {/* Counter bottom-left: the mock-ups carry their own caption in the
                top-left corner and a phone frame on the right. */}
            <span
              aria-hidden
              className="gallery-glass absolute bottom-2 left-2 rounded-full px-2 py-0.5 font-[family-name:var(--font-display)] text-[0.625rem] font-semibold tabular-nums tracking-wider text-[color:var(--color-foreground-soft)] md:bottom-3 md:left-3 md:px-2.5 md:py-1 md:text-[0.6875rem]"
            >
              <span className="text-[color:var(--color-accent)]">01</span> / {pad(total)}
            </span>
            <span
              aria-hidden
              className="gallery-glass absolute bottom-3 right-3 hidden h-9 w-9 translate-y-1 items-center justify-center rounded-full text-[color:var(--color-foreground)] opacity-0 transition duration-300 md:flex group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
            </span>
          </button>
        </li>

        {thumbs.map((image, position) => {
          const index = position + 1;
          const isLast = position === thumbs.length - 1;
          const badge = isLast ? hiddenCount : 0;
          return (
            <li key={image} className={`flex ${isLast && layout.last ? layout.last : ""}`}>
              <button
                type="button"
                onClick={() => viewer.show(index)}
                aria-label={`${title} — ${index + 1}/${total}`}
                className="bento-tile group relative block h-full w-full overflow-hidden"
              >
                <Image
                  src={image}
                  alt={`${title} — ${index + 1}`}
                  fill
                  sizes="(min-width: 1536px) 14rem, (min-width: 1024px) 15vw, 25vw"
                  className="object-cover object-top transition duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
                />
                {badge > 0 && (
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center bg-[color:var(--color-background)]/65 font-[family-name:var(--font-display)] text-base font-semibold text-[color:var(--color-foreground)] backdrop-blur-[2px] md:text-lg"
                  >
                    +{badge}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <GalleryViewer images={images} title={title} labels={labels} viewer={viewer} shots={shots} />
    </div>
  );
}
