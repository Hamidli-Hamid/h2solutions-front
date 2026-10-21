import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { CardLink } from "@/components/ui/CardLink";
import { CardMedia } from "@/components/ui/CardMedia";
import { localePath, type Locale } from "@/i18n-config";
import type { ApiProject } from "@/lib/api";

type Props = {
  project: ApiProject;
  lang: Locale;
  ctaLabel: string;
  variant?: number;
  headingLevel?: "h2" | "h3";
  sizes?: string;
};

export function ProjectCard({
  project,
  lang,
  ctaLabel,
  variant = 0,
  headingLevel: Heading = "h2",
  sizes,
}: Props) {
  const meta = [project.client, project.year].filter(Boolean).join(" · ");
  const href = localePath(lang, `/portfolio/${project.slug}`);

  return (
    <article
      data-glow
      className="panel panel-interactive glow-card sheen group flex h-full flex-col overflow-hidden"
    >
      <CardMedia
        src={project.cover_image}
        alt={project.title}
        variant={variant}
        sizes={sizes}
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        {meta && <p className="chip w-fit">{meta}</p>}
        <Heading className="mt-3 text-base font-semibold md:text-[1.0625rem]">
          <Link
            href={href}
            className="transition group-hover:text-[color:var(--color-accent)]"
          >
            {project.title}
          </Link>
        </Heading>
        <p className="mt-2.5 flex-1 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
          {project.summary}
        </p>
        <span
          aria-hidden
          className="mt-6 inline-flex items-center gap-2 text-[0.8125rem] font-medium text-[color:var(--color-accent)]"
        >
          {ctaLabel}
          <span className="arrow-chip h-6 w-6">
            <ArrowRightIcon className="h-3 w-3" />
          </span>
        </span>
      </div>

      <CardLink href={href} />
    </article>
  );
}
