"use client";

import Image from "next/image";
import { useState } from "react";
import { PlayIcon } from "@heroicons/react/24/solid";

import type { ProjectVideoSource } from "@/lib/video";

type Props = {
  video: ProjectVideoSource;
  /** Still shown before playback starts; the project cover when there is one. */
  poster: string | null;
  title: string;
  labels: {
    heading: string;
    play: string;
  };
};

/**
 * Leads the project detail page. Uploaded clips play in the native player;
 * YouTube/Vimeo links stay behind a poster facade until the visitor asks for
 * them, so the embed's scripts never touch the initial load.
 */
export function ProjectVideo({ video, poster, title, labels }: Props) {
  // Without a poster there is nothing to show in place of the player.
  const [playing, setPlaying] = useState(!poster);

  return (
    <section aria-labelledby="video-heading" className="reveal">
      <div className="container-h2 py-10 md:py-12">
        <h2 id="video-heading" className="text-2xl font-bold md:text-[1.75rem]">
          {labels.heading}
        </h2>

        <div className="panel relative mt-6 aspect-video w-full overflow-hidden p-0">
          {video.kind === "file" ? (
            <video
              controls
              playsInline
              preload="metadata"
              poster={poster ?? undefined}
              className="h-full w-full bg-black object-contain"
            >
              <source src={video.src} />
              {labels.play}
            </video>
          ) : playing ? (
            <iframe
              src={`${video.src}${video.src.includes("?") ? "&" : "?"}autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={labels.play}
              className="group absolute inset-0 block h-full w-full"
            >
              {poster && (
                <Image
                  src={poster}
                  alt={title}
                  fill
                  sizes="(min-width: 1280px) 1200px, 100vw"
                  priority
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                />
              )}
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center bg-[color:var(--color-background)]/45 transition group-hover:bg-[color:var(--color-background)]/30"
              >
                <span className="icon-tile h-16 w-16 transition group-hover:border-[color:var(--color-accent)] group-hover:text-[color:var(--color-accent)]">
                  <PlayIcon className="h-7 w-7 translate-x-[1px]" />
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
