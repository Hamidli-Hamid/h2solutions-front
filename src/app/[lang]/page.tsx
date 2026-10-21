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
import { fetchBlogPosts, fetchProjects, fetchServices, withFallback } from "@/lib/api";
import { getPageSeo } from "@/lib/content";
import { isLocale } from "@/i18n-config";
import { faqJsonLd, itemListJsonLd, mergeAdminNodes } from "@/lib/jsonld";
import { localeUrl } from "@/lib/site-config";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  /* The home page is built to render from the bundled copy when the API is
     down, so its three lists are the fail-soft kind: a failed read renders as
     "none" (the hero links to /services, the previews are left out) and is
     logged. */
  const [dict, services, projects, posts, pageSeo] = await Promise.all([
    getDictionary(lang),
    withFallback(fetchServices(lang), [], `Home services (${lang})`),
    withFallback(fetchProjects(lang), [], `Home projects (${lang})`),
    withFallback(fetchBlogPosts(lang), [], `Home posts (${lang})`),
    getPageSeo(lang, "home"),
  ]);

  /* Section ordinals count only what is on the page, so hiding an empty
     preview does not leave "02" as the first number. */
  const projectsIndex = 1;
  const processIndex = projects.some((p) => p.show_on_home) ? projectsIndex + 1 : projectsIndex;
  const faqIndex = processIndex + 1;
  const blogIndex = faqIndex + 1;

  const serviceList = itemListJsonLd(
    dict.services.title,
    services.map((s) => ({
      name: s.title,
      url: localeUrl(lang, `/services/${s.slug}`),
    })),
  );

  return (
    /* Square grid only behind the hero; the glow still spans every section. */
    <div className="tech-canvas">
      <Hero lang={lang} dict={dict} services={services} />
      <ProjectsShowcase lang={lang} dict={dict} projects={projects} index={projectsIndex} />
      <ProcessSteps dict={dict} index={processIndex} />
      <FaqAccordion
        content={dict.home.faq}
        index={faqIndex}
        image={{ src: "/images/home/faq-projects.webp", alt: dict.home.faq.imageAlt, width: 1200, height: 1200 }}
      />
      <BlogPreview lang={lang} dict={dict} posts={posts} index={blogIndex} />
      <SeoContent
        content={dict.home.seoText}
        image={{ src: "/images/home/seo-code.webp", alt: dict.home.seoText.imageAlt, width: 1200, height: 900 }}
      />
      {/* Closing call to action — the last thing above the footer. */}
      <CtaBanner
        lang={lang}
        dict={dict}
        title={dict.home.cta.title}
        subtitle={dict.home.cta.subtitle}
        className="reveal"
      />

      <JsonLd
        id="ld-home"
        data={mergeAdminNodes(
          [
            ...(services.length > 0 ? [serviceList] : []),
            faqJsonLd(dict.home.faq.items),
          ],
          pageSeo?.structured_data,
          lang,
        )}
      />
    </div>
  );
}
