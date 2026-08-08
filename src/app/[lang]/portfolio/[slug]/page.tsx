import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { ProjectGallery } from "@/components/sections/ProjectGallery";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { fetchProject, fetchProjects } from "@/lib/api";
import { i18n, isLocale } from "@/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { getPageSeo } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import { breadcrumbJsonLd, projectJsonLd } from "@/lib/jsonld";

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

  const related = allProjects.filter((item) => item.slug !== slug).slice(0, 3);
  /* The cover chosen in the admin leads the mosaic; the rest follow in
     upload order, de-duplicated in case the cover is also in the gallery. */
  const galleryImages = Array.from(
    new Set(
      [project.cover_image, ...project.gallery].filter(
        (src): src is string => Boolean(src),
      ),
    ),
  );

  const story = [
    {
      label: dict.portfolio.problemLabel,
      text: project.problem,
      icon: ExclamationTriangleIcon,
      accent: false,
    },
    {
      label: dict.portfolio.solutionLabel,
      text: project.solution,
      icon: WrenchScrewdriverIcon,
      accent: false,
    },
    {
      label: dict.portfolio.resultLabel,
      text: project.result,
      icon: SparklesIcon,
      accent: true,
    },
  ].filter((block) => Boolean(block.text));

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

      {(project.client || project.year) && (
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
          </dl>
        </div>
      )}

      <ProjectGallery
        images={galleryImages}
        title={project.title}
        labels={{
          heading: dict.portfolio.galleryTitle,
          hint: dict.portfolio.galleryHint,
          close: dict.portfolio.galleryClose,
        }}
      />

      <article aria-labelledby="overview-heading" className="reveal">
        <div className="container-h2 py-12 md:py-14">
          <h2 id="overview-heading" className="text-2xl font-bold md:text-[1.75rem]">
            {dict.portfolio.overviewTitle}
          </h2>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {story.map((block) => (
              <section
                key={block.label}
                className={`panel flex flex-col p-6 ${
                  block.accent
                    ? "border-[color:color-mix(in_oklab,var(--color-accent)_40%,transparent)]"
                    : ""
                }`}
              >
                <span aria-hidden className="icon-tile h-10 w-10">
                  <block.icon className="h-5 w-5" />
                </span>
                <h3
                  className={`mt-5 text-base font-semibold ${
                    block.accent ? "text-[color:var(--color-accent)]" : ""
                  }`}
                >
                  {block.label}
                </h3>
                <p className="mt-3 text-[0.875rem] leading-[1.85] text-[color:var(--color-foreground-soft)]">
                  {block.text}
                </p>
              </section>
            ))}
          </div>
        </div>
      </article>

      <ProcessSteps dict={dict} />

      {related.length > 0 && (
        <section aria-labelledby="related-projects-heading" className="reveal">
          <div className="container-h2 py-12 md:py-14">
            <p className="section-label">{dict.portfolio.title}</p>
            <h2
              id="related-projects-heading"
              className="mt-3 text-2xl font-bold md:text-[1.75rem]"
            >
              {dict.portfolio.related}
            </h2>
            <ul className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((item, index) => (
                <li key={item.slug} className="flex">
                  <ProjectCard
                    project={item}
                    lang={lang}
                    ctaLabel={dict.portfolio.viewCase}
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

      <CtaBanner lang={lang} dict={dict} className="reveal" />
      <JsonLd
        id="ld-project"
        data={[projectJsonLd(project, lang), breadcrumb]}
      />
    </div>
  );
}
