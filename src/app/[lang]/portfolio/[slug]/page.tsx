import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectGallery } from "@/components/sections/ProjectGallery";
import { ProjectVideo } from "@/components/sections/ProjectVideo";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { hostname } from "@/lib/format";
import { fetchProject, fetchProjects } from "@/lib/api";
import { i18n, isLocale } from "@/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { getPageSeo } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import { breadcrumbJsonLd, projectJsonLd } from "@/lib/jsonld";
import { resolveProjectVideo } from "@/lib/video";

export async function generateStaticParams() {
  const all = await Promise.all(
    i18n.locales.map(async (lang) => {
      const projects = await fetchProjects(lang);
      return projects.map((project) => ({ lang, slug: project.slug }));
    }),
  );
  return all.flat();
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/portfolio/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const project = await fetchProject(slug, lang);
  if (!project) return {};

  const template = await getPageSeo(lang, "project-detail");

  return buildMetadata({
    lang,
    path: `/portfolio/${slug}`,
    title: project.title,
    description: project.summary,
    ogType: "article",
    images: [project.cover_image ?? project.gallery[0]],
    seo: { ...template, ...(project.seo ?? {}) },
  });
}

export default async function ProjectDetailPage({
  params,
}: PageProps<"/[lang]/portfolio/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, project, allProjects] = await Promise.all([
    getDictionary(lang),
    fetchProject(slug, lang),
    fetchProjects(lang),
  ]);

  if (!project) notFound();

  /* The rail beside the text lists the rest of the portfolio. */
  const related = allProjects.filter((item) => item.slug !== slug).slice(0, 5);
  /* The cover chosen in the admin leads the mosaic; the rest follow in
     upload order, de-duplicated in case the cover is also in the gallery. */
  const galleryImages = Array.from(
    new Set(
      [project.cover_image, ...project.gallery].filter(
        (src): src is string => Boolean(src),
      ),
    ),
  );
  const hasGallery = galleryImages.length > 0;
  const video = resolveProjectVideo(project);
  /* The bare host is what reads as the project's domain in the meta row. */
  const domain = project.url ? hostname(project.url) : null;

  const breadcrumb = breadcrumbJsonLd([
    { name: dict.nav.home, url: `${siteConfig.url}/${lang}` },
    { name: dict.portfolio.title, url: `${siteConfig.url}/${lang}/portfolio` },
    { name: project.title, url: `${siteConfig.url}/${lang}/portfolio/${slug}` },
  ]);

  return (
    <div className="tech-canvas">
      <PageHeader
        withGrid={false}
        breadcrumbs={{
          label: dict.nav.menu,
          items: [
            { label: dict.nav.home, href: `/${lang}` },
            { label: dict.portfolio.title, href: `/${lang}/portfolio` },
            { label: project.title },
          ],
        }}
        eyebrow={dict.portfolio.title}
        title={project.title}
        subtitle={project.summary}
        actions={
          <>
            <Link href={`/${lang}/contact`} className="btn-primary">
              {dict.hero.ctaPrimary}
              <ArrowRightIcon aria-hidden className="h-4 w-4" />
            </Link>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                {dict.portfolio.visitSite}
                <ArrowTopRightOnSquareIcon aria-hidden className="h-4 w-4" />
              </a>
            )}
          </>
        }
      />

      {(project.client || project.year || domain) && (
        <div className="container-h2 pb-4">
          <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            {project.client && (
              <div className="flex items-center gap-2">
                <dt className="text-[color:var(--color-foreground-muted)]">
                  {dict.portfolio.clientLabel}:
                </dt>
                <dd className="font-medium">{project.client}</dd>
              </div>
            )}
            {project.year && (
              <div className="flex items-center gap-2">
                <dt className="text-[color:var(--color-foreground-muted)]">
                  {dict.portfolio.yearLabel}:
                </dt>
                <dd className="font-medium">{project.year}</dd>
              </div>
            )}
            {domain && (
              <div className="flex items-center gap-2">
                <dt className="text-[color:var(--color-foreground-muted)]">
                  {dict.portfolio.domainLabel}:
                </dt>
                <dd className="font-medium">
                  <a
                    href={project.url ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-strong)]"
                  >
                    {domain}
                    <ArrowTopRightOnSquareIcon aria-hidden className="h-3.5 w-3.5" />
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {video && (
        <ProjectVideo
          video={video}
          poster={project.cover_image ?? galleryImages[0] ?? null}
          title={project.title}
          labels={{
            heading: dict.portfolio.videoTitle,
            play: dict.portfolio.videoPlay,
          }}
        />
      )}

      {/* Under the video: the project text with its gallery below it, and the
          rest of the portfolio in the rail beside them. */}
      <div className="reveal">
        <div className="container-h2 grid items-start gap-10 py-12 md:py-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
          <div className="min-w-0">
            <article aria-labelledby="overview-heading">
              <h2
                id="overview-heading"
                className="text-2xl font-bold md:text-[1.75rem]"
              >
                {dict.portfolio.overviewTitle}
              </h2>
              {/* The text keeps the panel background the old story blocks had. */}
              <div className="panel mt-6 p-6 md:p-8">
                <div
                  className="prose-tech max-w-[68ch]"
                  /* Content comes from the admin rich editor, which stores HTML. */
                  dangerouslySetInnerHTML={{ __html: project.body ?? "" }}
                />
              </div>
            </article>

            {hasGallery && (
              <div className="mt-12">
                <ProjectGallery
                  variant="stacked"
                  images={galleryImages}
                  title={project.title}
                  labels={{
                    heading: dict.portfolio.galleryTitle,
                    hint: dict.portfolio.galleryHint,
                    close: dict.portfolio.galleryClose,
                  }}
                />
              </div>
            )}
          </div>

          {/* Heading + panel, mirroring the text column so both cards line up
              on the same edge. */}
          {related.length > 0 && (
            <aside className="lg:sticky lg:top-24">
              <h2
                id="related-projects-heading"
                className="text-2xl font-bold md:text-[1.75rem]"
              >
                {dict.portfolio.related}
              </h2>
              <nav
                aria-labelledby="related-projects-heading"
                className="panel mt-6 p-6 md:p-8"
              >
                <ul>
                  {related.map((item) => (
                    <li
                      key={item.slug}
                      className="border-t border-[color:var(--color-border)] first:border-t-0 first:[&>a]:pt-0"
                    >
                      <Link
                        href={`/${lang}/portfolio/${item.slug}`}
                        className="group flex items-start gap-3 py-3.5"
                      >
                        <span className="media-placeholder relative aspect-16/10 w-20 flex-none overflow-hidden rounded-md border border-[color:var(--color-border)]">
                          {item.cover_image && (
                            <Image
                              src={item.cover_image}
                              alt=""
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          )}
                        </span>

                        <span className="flex min-w-0 flex-col gap-1.5">
                          <span className="text-[0.875rem] font-medium leading-snug transition group-hover:text-[color:var(--color-accent)]">
                            {item.title}
                          </span>
                          <span className="flex flex-wrap items-center gap-x-2 text-[0.6875rem] text-[color:var(--color-foreground-muted)]">
                            {item.client && <span>{item.client}</span>}
                            {item.client && item.year && <span aria-hidden>·</span>}
                            {item.year && <span>{item.year}</span>}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/${lang}/portfolio`}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-strong)]"
                >
                  {dict.portfolio.title}
                  <ArrowRightIcon aria-hidden className="h-4 w-4" />
                </Link>
              </nav>
            </aside>
          )}
        </div>
      </div>

      <ProcessSteps dict={dict} />

      <CtaBanner lang={lang} dict={dict} className="reveal" />
      <JsonLd
        id="ld-project"
        data={[projectJsonLd(project, lang), breadcrumb]}
      />
    </div>
  );
}
