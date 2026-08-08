import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { CardMedia } from "@/components/ui/CardMedia";
import type { Locale } from "@/i18n-config";
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

  return (
    <article className="panel panel-interactive group flex h-full flex-col overflow-hidden">
      <CardMedia
        src={project.cover_image}
        alt={project.title}
        variant={variant}
        sizes={sizes}
      />
      <div className="flex flex-1 flex-col p-5">
        {meta && (
          <p className="text-[0.75rem] text-[color:var(--color-foreground-muted)]">
            {meta}
          </p>
        )}
        <Heading className="mt-2 text-base font-semibold">
          <Link
            href={`/${lang}/portfolio/${project.slug}`}
            className="transition before:absolute before:inset-0 before:content-[''] group-hover:text-[color:var(--color-accent)]"
          >
            {project.title}
          </Link>
        </Heading>
        <p className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
          {project.summary}
        </p>
        <span
          aria-hidden
          className="mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-[color:var(--color-accent)]"
        >
          {ctaLabel}
          <ArrowRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
