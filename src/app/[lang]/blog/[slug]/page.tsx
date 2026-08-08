import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

import { PageHeader } from "@/components/ui/PageHeader";
import { ShareLinks } from "@/components/ui/ShareLinks";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { fetchBlogPost, fetchBlogPosts } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { i18n, isLocale } from "@/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { getPageSeo } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import { blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

export async function generateStaticParams() {
  const all = await Promise.all(
    i18n.locales.map(async (lang) => {
      const posts = await fetchBlogPosts(lang);
      return posts.map((post) => ({ lang, slug: post.slug }));
    }),
  );
  return all.flat();
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const post = await fetchBlogPost(slug, lang);
  if (!post) return {};

  const template = await getPageSeo(lang, "blog-detail");

  return buildMetadata({
    lang,
    path: `/blog/${slug}`,
    title: post.title,
    description: post.excerpt,
    ogType: "article",
    images: [post.cover_image],
    publishedTime: post.published_at,
    seo: { ...template, ...(post.seo ?? {}) },
  });
}

export default async function BlogPostPage({
  params,
}: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, post, allPosts] = await Promise.all([
    getDictionary(lang),
    fetchBlogPost(slug, lang),
    fetchBlogPosts(lang),
  ]);

  if (!post) notFound();

  /* The five most recent other posts, listed in the rail beside the article. */
  const related = allPosts.filter((item) => item.slug !== slug).slice(0, 5);
  const published = formatDate(post.published_at, lang);
  const url = `${siteConfig.url}/${lang}/blog/${slug}`;

  const breadcrumb = breadcrumbJsonLd([
    { name: dict.nav.home, url: `${siteConfig.url}/${lang}` },
    { name: dict.blog.title, url: `${siteConfig.url}/${lang}/blog` },
    { name: post.title, url },
  ]);

  const meta = [
    published && {
      icon: CalendarDaysIcon,
      label: dict.blog.publishedAt,
      value: published,
      dateTime: post.published_at ?? undefined,
    },
    {
      icon: ClockIcon,
      label: null,
      value: `${post.read_minutes} ${dict.blog.minRead}`,
      dateTime: undefined,
    },
    post.author?.name && {
      icon: UserCircleIcon,
      label: dict.blog.authorLabel,
      value: post.author.name,
      dateTime: undefined,
    },
  ].filter(Boolean) as Array<{
    icon: typeof ClockIcon;
    label: string | null;
    value: string;
    dateTime?: string;
  }>;

  return (
    <div className="tech-canvas">
      <PageHeader
        withGrid={false}
        breadcrumbs={{
          label: dict.nav.menu,
          items: [
            { label: dict.nav.home, href: `/${lang}` },
            { label: dict.blog.title, href: `/${lang}/blog` },
            { label: post.title },
          ],
        }}
        eyebrow={dict.blog.label}
        title={post.title}
        subtitle={post.excerpt}
      />

      <div className="container-h2 pb-10">
        <dl className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[color:var(--color-foreground-muted)]">
          {meta.map((item) => (
            <div key={item.value} className="flex items-center gap-2">
              <dt className="flex items-center gap-2">
                <item.icon aria-hidden className="h-4 w-4 text-[color:var(--color-accent)]" />
                <span className="sr-only">{item.label ?? dict.blog.minRead}</span>
              </dt>
              <dd className="text-[color:var(--color-foreground-soft)]">
                {item.dateTime ? (
                  <time dateTime={item.dateTime}>{item.value}</time>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {post.cover_image && (
        <div className="container-h2 pb-12 md:pb-14">
          <div className="panel relative aspect-16/9 overflow-hidden">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              priority
              sizes="(min-width: 1280px) 80rem, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* BODY — article beside a sticky rail listing the other posts. */}
      <div className="container-h2 grid gap-10 pb-12 md:pb-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
        <article
          className="prose-tech max-w-[68ch]"
          /* Content comes from the admin rich editor, which stores HTML. */
          dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
        />

        {/* Rail order: share, then the project CTA, then the other posts. */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto">
          <div className="panel p-6">
            <ShareLinks url={url} title={post.title} label={dict.blog.shareLabel} />
          </div>

          <div className="panel p-6">
            <h2 className="text-base font-semibold">{dict.blog.helpTitle}</h2>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
              {dict.blog.helpText}
            </p>
            <Link
              href={`/${lang}/contact`}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-strong)]"
            >
              {dict.hero.ctaPrimary}
              <ArrowRightIcon aria-hidden className="h-4 w-4" />
            </Link>
          </div>

          {related.length > 0 && (
            <nav aria-labelledby="related-posts-heading" className="panel p-6">
              <h2
                id="related-posts-heading"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-foreground-muted)]"
              >
                {dict.blog.related}
              </h2>
              <ul className="mt-4">
                {related.map((item) => {
                  const itemDate = formatDate(item.published_at, lang);
                  return (
                    <li
                      key={item.slug}
                      className="border-t border-[color:var(--color-border)] first:border-t-0 first:[&>a]:pt-0"
                    >
                      <Link
                        href={`/${lang}/blog/${item.slug}`}
                        className="group flex items-start gap-3 py-3.5"
                      >
                        {/* Thumbnail; the placeholder texture stands in when a
                            post has no cover image. */}
                        <span className="media-placeholder relative aspect-16/10 w-20 flex-none overflow-hidden rounded-md border border-[color:var(--color-border)]">
                          {item.cover_image ? (
                            <Image
                              src={item.cover_image}
                              alt=""
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <svg
                              aria-hidden
                              viewBox="0 0 80 50"
                              className="absolute inset-0 h-full w-full text-[color:var(--color-accent)] opacity-45"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            >
                              <path d="M10 36 26 24 44 30 70 14" strokeOpacity="0.6" />
                              <circle cx="26" cy="24" r="2.2" fill="currentColor" stroke="none" />
                              <circle cx="44" cy="30" r="2.2" fill="currentColor" stroke="none" />
                              <circle cx="70" cy="14" r="2.8" fill="currentColor" stroke="none" />
                            </svg>
                          )}
                        </span>

                        <span className="flex min-w-0 flex-col gap-1.5">
                          <span className="text-[0.875rem] font-medium leading-snug transition group-hover:text-[color:var(--color-accent)]">
                            {item.title}
                          </span>
                          <span className="flex flex-wrap items-center gap-x-2 text-[0.6875rem] text-[color:var(--color-foreground-muted)]">
                            {itemDate && (
                              <time dateTime={item.published_at ?? undefined}>
                                {itemDate}
                              </time>
                            )}
                            {itemDate && <span aria-hidden>·</span>}
                            <span>
                              {item.read_minutes} {dict.blog.minRead}
                            </span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 border-t border-[color:var(--color-border)] pt-4">
                <Link
                  href={`/${lang}/blog`}
                  className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-strong)]"
                >
                  {dict.blog.latestTitle}
                  <ArrowRightIcon aria-hidden className="h-3.5 w-3.5" />
                </Link>
              </div>
            </nav>
          )}
        </aside>
      </div>

      <CtaBanner lang={lang} dict={dict} className="reveal" />
      <JsonLd id="ld-blog-post" data={[blogPostingJsonLd(post, lang), breadcrumb]} />
    </div>
  );
}
