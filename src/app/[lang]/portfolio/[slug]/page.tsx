import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectGallery } from "@/components/sections/ProjectGallery";
import { ProjectVideo } from "@/components/sections/ProjectVideo";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { fetchProject, fetchProjects } from "@/lib/api";
import { shotsByImage } from "@/lib/project-shots";
import { localePath, i18n, isLocale } from "@/i18n-config";
import { buildMetadata, twitterHandleFor } from "@/lib/seo";
import { getPageSeo } from "@/lib/content";
import { localeUrl } from "@/lib/site-config";
import { breadcrumbJsonLd, mergeAdminNodes, projectJsonLd } from "@/lib/jsonld";
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
  if (!isLocale(lang)) notFound();
  const project = await fetchProject(slug, lang);
  // Otherwise the 404 inherits the layout's canonical and hreflang (the home page's).
  if (!project) notFound();

  const [template, twitterHandle] = await Promise.all([
    getPageSeo(lang, "project-detail"),
    twitterHandleFor(lang),
  ]);

  return buildMetadata({
    lang,
    path: `/portfolio/${slug}`,
    title: project.title,
    description: project.summary,
    ogType: "article",
    images: [project.cover_image ?? project.gallery[0]],
    seo: { ...template, ...(project.seo ?? {}) },
    twitterHandle,
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
  const facts = [
    project.client && { label: dict.portfolio.clientLabel, value: project.client },
    project.year && { label: dict.portfolio.yearLabel, value: String(project.year) },
  ].filter(Boolean) as { label: string; value: string }[];

  const breadcrumb = breadcrumbJsonLd([
    { name: dict.nav.home, url: localeUrl(lang) },
    { name: dict.portfolio.title, url: localeUrl(lang, "/portfolio") },
    { name: project.title, url: localeUrl(lang, `/portfolio/${slug}`) },
  ]);

  return (
    <div className="tech-canvas">
      <PageHeader
        withGrid={false}
        breadcrumbs={{
          label: dict.nav.menu,
          items: [
            { label: dict.nav.home, href: localePath(lang) },
            { label: dict.portfolio.title, href: localePath(lang, "/portfolio") },
            { label: project.title },
          ],
        }}
        eyebrow={dict.portfolio.title}
        title={project.title}
        subtitle={project.summary}
        actions={
          <Link href={localePath(lang, "/contact")} className="btn-primary">
            {dict.hero.ctaPrimary}
            <ArrowRightIcon aria-hidden className="h-4 w-4" />
          </Link>
        }
      />

      {/* The gallery opens the page, straight under the title and wider than
          the text container — edge to edge up to a cap, so the work leads
          and the story about it follows underneath. */}
      {hasGallery && (
        <div className="mx-auto w-full max-w-[120rem] px-4 pb-4 md:px-6">
          <ProjectGallery
            images={galleryImages}
            shots={shotsByImage(project)}
            title={project.title}
            labels={{
              heading: dict.portfolio.galleryTitle,
              hint: dict.portfolio.galleryHint,
              close: dict.portfolio.galleryClose,
              prev: dict.portfolio.galleryPrev,
              next: dict.portfolio.galleryNext,
            }}
          />
        </div>
      )}

      {/* Under the gallery: the facts and the project text, with the rest of
          the portfolio in the rail beside them. */}
      <div className="reveal">
        <div className="container-h2 grid items-start gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
          <article aria-labelledby="overview-heading" className="min-w-0">
            <h2 id="overview-heading" className="type-h2">
              {dict.portfolio.overviewTitle}
            </h2>

            {facts.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-3">
                {facts.map((fact) => (
                  <div key={fact.label} className="panel min-w-0 px-5 py-4">
                    <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-foreground-muted)]">
                      {fact.label}
                    </dt>
                    <dd className="mt-1.5 truncate font-[family-name:var(--font-display)] text-base font-semibold">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {/* The text keeps the panel background the old story blocks had. */}
            <div className="panel mt-3 p-6 md:p-8">
              <div
                className="prose-tech max-w-[68ch]"
                /* Content comes from the admin rich editor, which stores HTML. */
                dangerouslySetInnerHTML={{ __html: project.body ?? "" }}
              />
            </div>
          </article>

          {/* Heading + panel, mirroring the text column so both cards line up
              on the same edge. */}
          {related.length > 0 && (
            <aside className="lg:sticky lg:top-24">
              <h2
                id="related-projects-heading"
                className="type-h2"
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
                        href={localePath(lang, `/portfolio/${item.slug}`)}
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
                  href={localePath(lang, "/portfolio")}
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

      <ProcessSteps dict={dict} />

      <CtaBanner lang={lang} dict={dict} className="reveal" />
      <JsonLd
        id="ld-project"
        data={mergeAdminNodes(
          [projectJsonLd(project, lang), breadcrumb],
          project.seo?.structured_data,
          lang,
        )}
      />
    </div>
  );
}
