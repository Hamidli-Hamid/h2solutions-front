import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { CardMedia } from "@/components/ui/CardMedia";
import type { Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";
import type { ApiProject } from "@/lib/api";

type Props = {
  lang: Locale;
  dict: Dictionary;
  projects: ApiProject[];
};

type Card = {
  key: string;
  title: string;
  category: string;
  href: string;
  image: string | null;
};

export function ProjectsShowcase({ lang, dict, projects }: Props) {
  const t = dict.home.projects;

  /* Real portfolio data wins; the curated samples only fill the section
     while the CMS has no published projects yet. */
  const cards: Card[] =
    projects.length > 0
      ? projects.slice(0, 4).map((project) => ({
          key: project.slug,
          title: project.title,
          category: [project.client, project.year].filter(Boolean).join(" · "),
          href: `/${lang}/portfolio/${project.slug}`,
          image: project.cover_image,
        }))
      : t.samples.map((sample) => ({
          key: sample.title,
          title: sample.title,
          category: sample.category,
          href: `/${lang}/portfolio`,
          image: null,
        }));

  return (
    <section
      aria-labelledby="projects-heading"
      className="reveal"
    >
      <div className="container-h2 pb-12 pt-8 md:pb-14 md:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">{t.label}</p>
            <h2
              id="projects-heading"
              className="mt-3 text-2xl font-bold md:text-[1.75rem]"
            >
              {t.title}
            </h2>
          </div>
          <Link
            href={`/${lang}/portfolio`}
            className="btn-secondary px-4 py-2 text-sm"
          >
            {t.viewAll}
            <ArrowRightIcon aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        <ul className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => (
            <li key={card.key} className="flex">
              <article className="panel panel-interactive group flex w-full flex-col overflow-hidden">
                <CardMedia src={card.image} alt={card.title} variant={index} />
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-[0.95rem] font-semibold">
                    <Link
                      href={card.href}
                      className="transition group-hover:text-[color:var(--color-accent)] before:absolute before:inset-0 before:content-['']"
                    >
                      {card.title}
                    </Link>
                  </h3>
                  <p className="mt-1.5 flex-1 text-[0.8125rem] text-[color:var(--color-foreground-muted)]">
                    {card.category}
                  </p>
                  <span
                    aria-hidden
                    className="mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-[color:var(--color-accent)]"
                  >
                    {t.viewCase}
                    <ArrowRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
