import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { CardMedia } from "@/components/ui/CardMedia";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";
import type { ApiBlogPost } from "@/lib/api";

type Props = {
  lang: Locale;
  dict: Dictionary;
  posts: ApiBlogPost[];
};

type Card = {
  key: string;
  title: string;
  date: string | null;
  href: string;
  image: string | null;
};

export function BlogPreview({ lang, dict, posts }: Props) {
  const t = dict.home.blog;

  /* Published posts win; samples only stand in until the blog has content. */
  const cards: Card[] =
    posts.length > 0
      ? posts.slice(0, 4).map((post) => ({
          key: post.slug,
          title: post.title,
          date: post.published_at,
          href: `/${lang}/blog/${post.slug}`,
          image: post.cover_image,
        }))
      : t.samples.map((sample) => ({
          key: sample.title,
          title: sample.title,
          date: sample.date,
          href: `/${lang}/blog`,
          image: null,
        }));

  return (
    <section aria-labelledby="blog-heading" className="reveal">
      <div className="container-h2 py-12 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">{t.label}</p>
            <h2 id="blog-heading" className="mt-3 text-2xl font-bold md:text-[1.75rem]">
              {t.title}
            </h2>
          </div>
          <Link href={`/${lang}/blog`} className="btn-secondary px-4 py-2 text-sm">
            {t.viewAll}
            <ArrowRightIcon aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        <ul className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => {
            const label = formatDate(card.date, lang);
            return (
              <li key={card.key} className="flex">
                <article className="panel panel-interactive group flex w-full flex-col overflow-hidden">
                  <CardMedia src={card.image} alt={card.title} variant={index} />
                  <div className="flex flex-1 flex-col p-5">
                    {label && (
                      <time
                        dateTime={card.date ?? undefined}
                        className="text-[0.75rem] text-[color:var(--color-foreground-muted)]"
                      >
                        {label}
                      </time>
                    )}
                    <h3 className="mt-2 flex-1 text-[0.9375rem] font-semibold leading-snug">
                      <Link
                        href={card.href}
                        className="transition group-hover:text-[color:var(--color-accent)] before:absolute before:inset-0 before:content-['']"
                      >
                        {card.title}
                      </Link>
                    </h3>
                    <span
                      aria-hidden
                      className="mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-[color:var(--color-accent)]"
                    >
                      {t.readMore}
                      <ArrowRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
