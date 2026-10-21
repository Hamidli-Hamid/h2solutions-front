import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { ProjectTimelineGallery } from "@/components/sections/ProjectTimelineGallery";
import { CardLink } from "@/components/ui/CardLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { localePath, type Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";
import type { ApiProject } from "@/lib/api";
import { shotsByImage } from "@/lib/project-shots";

type Props = {
  lang: Locale;
  dict: Dictionary;
  projects: ApiProject[];
  /** Ordinal beside the label; the home page numbers only the sections it shows. */
  index: number;
};

/** Entries on the home page; the full list lives on /portfolio. Mirrors the
    backend's Project::HOME_LIMIT, which already refuses an eleventh. */
const MAX_ENTRIES = 10;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The projects ticked "Show on the home page" in the admin, in the order the
 * API returns them — the admin's own Order field, lowest first. Nothing is
 * re-sorted here: which projects appear, and in what order, is the editor's
 * call.
 */
function selected(projects: ApiProject[]): ApiProject[] {
  return projects.filter((project) => project.show_on_home).slice(0, MAX_ENTRIES);
}

/**
 * Published case studies as a vertical timeline: each entry has its story on
 * the left — step, year, client, title, summary, case link — and its shots as a
 * gallery on the right. A rail runs down the left edge and fills as the
 * timeline scrolls past; each node lights when its entry reaches the middle
 * of the viewport.
 *
 * There is deliberately no link to the client's live site, here or on the
 * case page: a visitor who leaves to look at it does not come back.
 *
 * With no project picked for the home page — or when the list could not be
 * read — the whole section, heading included, is left out: sample cards presented work that does not
 * exist as if it did.
 */
export function ProjectsShowcase({ lang, dict, projects, index }: Props) {
  const t = dict.home.projects;
  const picked = selected(projects);
  if (picked.length === 0) return null;

  const entries = picked.map((project) => ({
    key: project.slug,
    title: project.title,
    summary: project.summary,
    client: project.client,
    year: project.year,
    href: localePath(lang, `/portfolio/${project.slug}`),
    /* Cover first, then the gallery in upload order, de-duplicated in case
       the cover is also in the gallery — the same set the case page shows. */
    images: Array.from(
      new Set([project.cover_image, ...project.gallery].filter((src): src is string => Boolean(src))),
    ),
    shots: shotsByImage(project),
  }));

  const galleryLabels = {
    heading: dict.portfolio.galleryTitle,
    hint: dict.portfolio.galleryHint,
    close: dict.portfolio.galleryClose,
    prev: dict.portfolio.galleryPrev,
    next: dict.portfolio.galleryNext,
  };

  return (
    <section aria-labelledby="projects-heading" className="reveal">
      <div className="container-h2 pb-14 pt-12 md:pb-20 md:pt-16">
        <SectionHeading
          id="projects-heading"
          label={t.label}
          title={t.title}
          index={index}
          action={
            <Link
              href={localePath(lang, "/portfolio")}
              className="btn-secondary px-5 py-2.5 text-sm"
            >
              {t.viewAll}
              <ArrowRightIcon aria-hidden className="h-4 w-4" />
            </Link>
          }
        />

        <ol className="project-timeline mt-10 md:mt-14">
          {entries.map((entry, position) => (
            <li key={entry.key} className="timeline-entry reveal-item">
              <span aria-hidden className="timeline-node" />

              <article>
                <div className="flex items-center gap-3">
                  <span aria-hidden className="step-ordinal">
                    {pad(position + 1)}
                  </span>
                  {entry.year && (
                    <>
                      <span aria-hidden className="timeline-dash" />
                      <span className="font-[family-name:var(--font-display)] text-sm font-semibold tabular-nums tracking-[0.12em] text-[color:var(--color-foreground-muted)]">
                        {entry.year}
                      </span>
                    </>
                  )}
                </div>

                {/* Story and gallery share one row. The gallery's lead shot sets
                    its height; the copy stays short beside it — a two-line
                    summary, the whole of it is on the case page. */}
                <div className="mt-5 grid gap-6 md:gap-8 lg:grid-cols-12 lg:gap-10">
                  {/* The whole story block opens the case; the gallery beside it
                      keeps its own clicks for the viewer. */}
                  <div className="group relative lg:col-span-4">
                    {entry.client && <p className="chip flex w-fit">{entry.client}</p>}

                    <h3 className="type-h3 mt-3 text-balance">
                      <Link
                        href={entry.href}
                        className="transition group-hover:text-[color:var(--color-accent)]"
                      >
                        {entry.title}
                      </Link>
                    </h3>

                    {entry.summary && (
                      <p className="mt-3 line-clamp-2 max-w-xl text-[0.9375rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
                        {entry.summary}
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                      <Link
                        href={entry.href}
                        /* Above the block's overlay link, so its own hover state shows. */
                        className="btn-secondary relative z-[4] px-5 py-2.5 text-sm"
                      >
                        {t.viewCase}
                        <ArrowRightIcon aria-hidden className="h-4 w-4" />
                      </Link>
                    </div>

                    <CardLink href={entry.href} />
                  </div>

                  {entry.images.length > 0 && (
                    <div className="lg:col-span-8">
                      <ProjectTimelineGallery
                        images={entry.images}
                        shots={entry.shots}
                        title={entry.title}
                        labels={galleryLabels}
                      />
                    </div>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
