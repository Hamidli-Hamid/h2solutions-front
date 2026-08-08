import { notFound } from "next/navigation";

import { Hero } from "@/components/sections/Hero";
import { ProjectsShowcase } from "@/components/sections/ProjectsShowcase";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { SeoContent } from "@/components/sections/SeoContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { fetchBlogPosts, fetchProjects, fetchServices } from "@/lib/api";
import { isLocale } from "@/i18n-config";
import { faqJsonLd, itemListJsonLd } from "@/lib/jsonld";
import { siteConfig } from "@/lib/site-config";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, services, projects, posts] = await Promise.all([
    getDictionary(lang),
    fetchServices(lang),
    fetchProjects(lang),
    fetchBlogPosts(lang),
  ]);

  const serviceList = itemListJsonLd(
    dict.services.title,
    services.map((s) => ({
      name: s.title,
      url: `${siteConfig.url}/${lang}/services/${s.slug}`,
    })),
  );

  return (
    /* Square grid only behind the hero; the glow still spans every section. */
    <div className="tech-canvas">
      <Hero lang={lang} dict={dict} services={services} />
      <ProjectsShowcase lang={lang} dict={dict} projects={projects} />
      <ProcessSteps dict={dict} />
      <CtaBanner
        lang={lang}
        dict={dict}
        title={dict.home.cta.title}
        subtitle={dict.home.cta.subtitle}
        className="reveal"
      />
      <FaqAccordion dict={dict} />
      <BlogPreview lang={lang} dict={dict} posts={posts} />
      <SeoContent dict={dict} />

      {services.length > 0 && <JsonLd id="ld-home-services" data={serviceList} />}
      <JsonLd id="ld-home-faq" data={faqJsonLd(dict.home.faq.items)} />
    </div>
  );
}
