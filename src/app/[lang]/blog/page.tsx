import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { i18n, isLocale } from "@/i18n-config";
import { siteConfig } from "@/lib/site-config";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/jsonld";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const url = `${siteConfig.url}/${lang}/blog`;
  return {
    title: dict.blog.title,
    description: dict.blog.subtitle,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        i18n.locales.map((l) => [l, `${siteConfig.url}/${l}/blog`]),
      ),
    },
    openGraph: {
      title: `${dict.blog.title} — ${siteConfig.brand}`,
      description: dict.blog.subtitle,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.blog.title} — ${siteConfig.brand}`,
      description: dict.blog.subtitle,
    },
  };
}

export default async function BlogPage({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const url = `${siteConfig.url}/${lang}/blog`;
  const breadcrumb = breadcrumbJsonLd([
    { name: dict.nav.home, url: `${siteConfig.url}/${lang}` },
    { name: dict.blog.title, url },
  ]);
  const collection = collectionPageJsonLd({
    title: dict.blog.title,
    description: dict.blog.subtitle,
    url,
    lang,
  });

  return (
    <>
      <PageHeader
        eyebrow={dict.meta.siteName}
        title={dict.blog.title}
        subtitle={dict.blog.subtitle}
      />

      <section className="border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]">
        <div className="container-h2 py-20 md:py-28">
          <EmptyState
            icon={PencilSquareIcon}
            title={dict.blog.empty}
            description={dict.blog.subtitle}
          />
        </div>
      </section>

      <CtaBanner lang={lang} dict={dict} />
      <JsonLd id="ld-blog" data={[collection, breadcrumb]} />
    </>
  );
}
