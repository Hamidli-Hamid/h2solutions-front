import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { CardMedia } from "@/components/ui/CardMedia";
import { formatDate } from "@/lib/format";
import { localePath, type Locale } from "@/i18n-config";
import type { ApiBlogPost } from "@/lib/api";

type Props = {
  post: ApiBlogPost;
  lang: Locale;
  labels: { readMore: string; minRead: string };
  variant?: number;
  headingLevel?: "h2" | "h3";
  sizes?: string;
};

export function BlogCard({
  post,
  lang,
  labels,
  variant = 0,
  headingLevel: Heading = "h2",
  sizes,
}: Props) {
  const published = formatDate(post.published_at, lang);

  return (
    <article
      data-glow
      className="panel panel-interactive glow-card sheen group flex h-full flex-col overflow-hidden"
    >
      <CardMedia
        src={post.cover_image}
        alt={post.title}
        variant={variant}
        sizes={sizes}
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="flex flex-wrap items-center gap-2">
          {published && (
            <time dateTime={post.published_at ?? undefined} className="chip">
              {published}
            </time>
          )}
          <span className="chip">
            {post.read_minutes} {labels.minRead}
          </span>
        </p>

        <Heading className="mt-3 text-base font-semibold leading-snug md:text-[1.0625rem]">
          <Link
            href={localePath(lang, `/blog/${post.slug}`)}
            className="transition before:absolute before:inset-0 before:content-[''] group-hover:text-[color:var(--color-accent)]"
          >
            {post.title}
          </Link>
        </Heading>

        <p className="mt-2.5 flex-1 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
          {post.excerpt}
        </p>

        <span
          aria-hidden
          className="mt-6 inline-flex items-center gap-2 text-[0.8125rem] font-medium text-[color:var(--color-accent)]"
        >
          {labels.readMore}
          <span className="arrow-chip h-6 w-6">
            <ArrowRightIcon className="h-3 w-3" />
          </span>
        </span>
      </div>
    </article>
  );
}
