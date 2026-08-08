import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { fetchProjects } from "@/lib/api";
import { isLocale } from "@/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/jsonld";
import { BriefcaseIcon } from "@heroicons/react/24/outline";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/portfolio">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);

  return pageMetadata("portfolio", {
    lang,
    path: "/portfolio",
    title: dict.portfolio.title,
    description: dict.portfolio.subtitle,
  });
}

export default async function PortfolioPage({
  params,
}: PageProps<"/[lang]/portfolio">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [dict, projects] = await Promise.all([
    getDictionary(lang),
    fetchProjects(lang),
  ]);

  const url = `${siteConfig.url}/${lang}/portfolio`;
  const breadcrumb = breadcrumbJsonLd([
    { name: dict.nav.home, url: `${siteConfig.url}/${lang}` },
    { name: dict.portfolio.title, url },
  ]);
  const collection = collectionPageJsonLd({
    title: dict.portfolio.title,
    description: dict.portfolio.subtitle,
    url,
    lang,
  });
  const itemList = itemListJsonLd(
    dict.portfolio.title,
    projects.map((project) => ({
      name: project.title,
      url: `${siteConfig.url}/${lang}/portfolio/${project.slug}`,
    })),
  );

  return (
    <div className="tech-canvas">
      <PageHeader
        withGrid={false}
        breadcrumbs={{
          label: dict.nav.menu,
          items: [
            { label: dict.nav.home, href: `/${lang}` },
            { label: dict.portfolio.title },
          ],
        }}
        eyebrow={dict.meta.siteName}
        title={dict.portfolio.title}
        subtitle={dict.portfolio.subtitle}
        actions={
          <>
            <Link href={`/${lang}/contact`} className="btn-primary">
              {dict.hero.ctaPrimary}
              <ArrowRightIcon aria-hidden className="h-4 w-4" />
            </Link>
            <Link href={`/${lang}/services`} className="btn-secondary">
              {dict.servicesPreview.viewAll}
            </Link>
          </>
        }
      />

      <section aria-label={dict.portfolio.title}>
        <div className="container-h2 pb-12 md:pb-14">
          {projects.length === 0 ? (
            <EmptyState
              icon={BriefcaseIcon}
              title={dict.portfolio.empty}
              description={dict.portfolio.subtitle}
              ctaLabel={dict.hero.ctaPrimary}
              ctaHref={`/${lang}/contact`}
            />
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((project, index) => (
                <li key={project.slug} className="flex">
                  <ProjectCard
                    project={project}
                    lang={lang}
                    ctaLabel={dict.portfolio.viewCase}
                    variant={index}
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ProcessSteps dict={dict} />
      <CtaBanner lang={lang} dict={dict} className="reveal" />

      <JsonLd
        id="ld-portfolio"
        data={
          projects.length > 0
            ? [collection, itemList, breadcrumb]
            : [collection, breadcrumb]
        }
      />
    </div>
  );
}
