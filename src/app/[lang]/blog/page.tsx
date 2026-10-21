import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { BlogCard } from "@/components/ui/BlogCard";
import { CardMedia } from "@/components/ui/CardMedia";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { fetchBlogPosts } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { localePath, isLocale } from "@/i18n-config";
import { EMPTY_LISTING_ROBOTS, pageMetadata } from "@/lib/seo";
import { getPageSeo } from "@/lib/content";
import { localeUrl } from "@/lib/site-config";
import {
  blogJsonLd,
  breadcrumbJsonLd,
  itemListJsonLd,
  mergeAdminNodes,
} from "@/lib/jsonld";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  /* The same read the page makes (deduplicated). It throws when the API
     fails, so an outage can never pass for "no posts" and de-index the page. */
  const [dict, posts] = await Promise.all([
    getDictionary(lang),
    fetchBlogPosts(lang),
  ]);

  const metadata = await pageMetadata("blog", {
    lang,
    path: "/blog",
    title: dict.blog.title,
    description: dict.blog.subtitle,
  });

  return posts.length > 0 ? metadata : { ...metadata, robots: EMPTY_LISTING_ROBOTS };
}

export default async function BlogPage({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, posts, pageSeo] = await Promise.all([
    getDictionary(lang),
    fetchBlogPosts(lang),
    getPageSeo(lang, "blog"),
  ]);

  /* The newest post leads the page; the rest fill the grid below it. */
  const [featured, ...rest] = posts;
  const cardLabels = { readMore: dict.blog.readMore, minRead: dict.blog.minRead };

  const url = localeUrl(lang, "/blog");
  const breadcrumb = breadcrumbJsonLd([
    { name: dict.nav.home, url: localeUrl(lang) },
    { name: dict.blog.title, url },
  ]);
  const blog = blogJsonLd(dict, lang);
  const itemList = itemListJsonLd(
    dict.blog.title,
    posts.map((post) => ({
      name: post.title,
      url: localeUrl(lang, `/blog/${post.slug}`),
    })),
  );

  return (
    <div className="tech-canvas">
      <PageHeader
        withGrid={false}
        breadcrumbs={{
          label: dict.nav.menu,
          items: [
            { label: dict.nav.home, href: localePath(lang) },
            { label: dict.blog.title },
          ],
        }}
        eyebrow={dict.blog.label}
        title={dict.blog.title}
        subtitle={dict.blog.subtitle}
      />

      {posts.length === 0 ? (
        <section aria-label={dict.blog.title}>
          <div className="container-h2 pb-12 md:pb-14">
            <EmptyState
              icon={PencilSquareIcon}
              title={dict.blog.empty}
              description={dict.blog.subtitle}
              ctaLabel={dict.blog.emptyCta}
              ctaHref={localePath(lang, "/contact")}
            />
          </div>
        </section>
      ) : (
        <>
          {/* FEATURED — the latest post, wide on desktop. */}
          <section aria-labelledby="featured-post-heading" className="reveal">
            <div className="container-h2 pb-12 md:pb-14">
              <p className="section-label">{dict.blog.featuredLabel}</p>
              <article className="panel panel-interactive group mt-4 grid overflow-hidden md:grid-cols-2">
                <CardMedia
                  src={featured.cover_image}
                  alt={featured.title}
                  variant={0}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="aspect-16/10 border-b md:h-full md:border-b-0 md:border-r"
                />
                <div className="flex flex-col justify-center p-6 md:p-10">
                  <p className="flex flex-wrap items-center gap-x-2 text-[0.75rem] text-[color:var(--color-foreground-muted)]">
                    {formatDate(featured.published_at, lang) && (
                      <time dateTime={featured.published_at ?? undefined}>
                        {formatDate(featured.published_at, lang)}
                      </time>
                    )}
                    <span aria-hidden>·</span>
                    <span>
                      {featured.read_minutes} {dict.blog.minRead}
                    </span>
                  </p>

                  <h2
                    id="featured-post-heading"
                    className="type-h3 mt-4 leading-snug"
                  >
                    <Link
                      href={localePath(lang, `/blog/${featured.slug}`)}
                      className="transition before:absolute before:inset-0 before:content-[''] group-hover:text-[color:var(--color-accent)]"
                    >
                      {featured.title}
                    </Link>
                  </h2>

                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
                    {featured.excerpt}
                  </p>

                  <span
                    aria-hidden
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-accent)]"
                  >
                    {dict.blog.readMore}
                    <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </article>
            </div>
          </section>

          {rest.length > 0 && (
            <section aria-labelledby="all-posts-heading" className="reveal">
              <div className="container-h2 pb-12 md:pb-14">
                <h2 id="all-posts-heading" className="type-h2">
                  {dict.blog.latestTitle}
                </h2>
                <ul className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {rest.map((post, index) => (
                    <li key={post.slug} className="flex">
                      <BlogCard
                        post={post}
                        lang={lang}
                        labels={cardLabels}
                        variant={index + 1}
                        headingLevel="h3"
                        sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </>
      )}

      <CtaBanner lang={lang} dict={dict} className="reveal" />
      <JsonLd
        id="ld-blog"
        data={mergeAdminNodes(
          posts.length > 0 ? [blog, itemList, breadcrumb] : [blog, breadcrumb],
          pageSeo?.structured_data,
          lang,
        )}
      />
    </div>
  );
}
