import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { i18n, isLocale } from "@/i18n-config";
import { siteConfig } from "@/lib/site-config";
import { aboutPageJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const url = `${siteConfig.url}/${lang}/about`;
  return {
    title: dict.about.title,
    description: dict.about.story,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        i18n.locales.map((l) => [l, `${siteConfig.url}/${l}/about`]),
      ),
    },
    openGraph: {
      title: `${dict.about.title} — ${siteConfig.brand}`,
      description: dict.about.story,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.about.title} — ${siteConfig.brand}`,
      description: dict.about.story,
    },
  };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const breadcrumb = breadcrumbJsonLd([
    { name: dict.nav.home, url: `${siteConfig.url}/${lang}` },
    { name: dict.about.title, url: `${siteConfig.url}/${lang}/about` },
  ]);

  return (
    <>
      <PageHeader
        eyebrow={dict.meta.siteName}
        title={dict.about.title}
        subtitle={dict.about.subtitle}
      />

      <section className="border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]">
        <div className="container-h2 grid gap-12 py-20 md:grid-cols-[1.2fr_1fr] md:py-28">
          <div>
            <p className="text-lg leading-relaxed text-[color:var(--color-foreground-soft)]">
              {dict.about.story}
            </p>
          </div>
          <aside className="card flex flex-col gap-6 p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-foreground-muted)]">
                Founder
              </p>
              <p className="mt-2 text-xl font-semibold">{siteConfig.founder}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-foreground-muted)]">
                Domain
              </p>
              <p className="mt-2 font-mono text-sm">{siteConfig.domain}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-[color:var(--color-border)] bg-[color:var(--color-background-elevated)]">
        <div className="container-h2 py-20 md:py-28">
          <h2 className="text-3xl font-bold md:text-4xl">{dict.about.valuesTitle}</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {dict.about.values.map((value, i) => (
              <div key={i} className="card p-6 md:p-7">
                <span className="font-[var(--font-display)] text-3xl text-[color:var(--color-accent)]">
                  0{i + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-foreground-muted)]">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner lang={lang} dict={dict} />
      <JsonLd id="ld-about" data={[aboutPageJsonLd(dict, lang), breadcrumb]} />
    </>
  );
}
