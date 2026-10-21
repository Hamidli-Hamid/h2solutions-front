import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { CardMedia } from "@/components/ui/CardMedia";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatDate } from "@/lib/format";
import { localePath, type Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";
import type { ApiBlogPost } from "@/lib/api";

type Props = {
  lang: Locale;
  dict: Dictionary;
  posts: ApiBlogPost[];
  /** Ordinal beside the label; the home page numbers only the sections it shows. */
  index: number;
};

/**
 * Published posts only. With none — or when the list could not be read — the
 * section is left out entirely: dated sample articles were claims that posts
 * existed which never did.
 */
export function BlogPreview({ lang, dict, posts, index }: Props) {
  const t = dict.home.blog;
  if (posts.length === 0) return null;

  const cards = posts.slice(0, 4).map((post) => ({
    key: post.slug,
    title: post.title,
    date: post.published_at,
    href: localePath(lang, `/blog/${post.slug}`),
    image: post.cover_image,
  }));

  return (
    <section aria-labelledby="blog-heading" className="reveal">
      <div className="container-h2 py-14 md:py-20">
        <SectionHeading
          id="blog-heading"
          label={t.label}
          title={t.title}
          index={index}
          action={
            <Link
              href={localePath(lang, "/blog")}
              className="btn-secondary px-5 py-2.5 text-sm"
            >
              {t.viewAll}
              <ArrowRightIcon aria-hidden className="h-4 w-4" />
            </Link>
          }
        />

        {/* Framed cards here, deliberately unlike the cover-led portfolio
            grid above: an article is text first, so the copy keeps its own
            surface instead of sitting on the artwork. */}
        <ul className="mt-9 grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          {cards.map((card, position) => {
            const label = formatDate(card.date, lang);
            return (
              <li key={card.key} className="reveal-item flex">
                <article
                  data-glow
                  className="panel panel-interactive glow-card sheen group flex w-full flex-col overflow-hidden"
                >
                  <CardMedia src={card.image} alt={card.title} variant={position} />
                  <div className="flex flex-1 flex-col p-5">
                    {label && (
                      <time dateTime={card.date ?? undefined} className="chip w-fit">
                        {label}
                      </time>
                    )}
                    <h3 className="mt-3 flex-1 text-[0.9375rem] font-semibold leading-snug">
                      <Link
                        href={card.href}
                        className="transition group-hover:text-[color:var(--color-accent)] before:absolute before:inset-0 before:content-['']"
                      >
                        {card.title}
                      </Link>
                    </h3>
                    <span
                      aria-hidden
                      className="mt-5 inline-flex items-center gap-2 text-[0.8125rem] font-medium text-[color:var(--color-accent)]"
                    >
                      {t.readMore}
                      <span className="arrow-chip h-6 w-6">
                        <ArrowRightIcon className="h-3 w-3" />
                      </span>
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
