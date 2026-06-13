import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/sections/ContactForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { i18n, isLocale } from "@/i18n-config";
import { siteConfig } from "@/lib/site-config";
import { breadcrumbJsonLd, contactPageJsonLd } from "@/lib/jsonld";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const url = `${siteConfig.url}/${lang}/contact`;
  return {
    title: dict.contact.title,
    description: dict.contact.subtitle,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        i18n.locales.map((l) => [l, `${siteConfig.url}/${l}/contact`]),
      ),
    },
    openGraph: {
      title: `${dict.contact.title} — ${siteConfig.brand}`,
      description: dict.contact.subtitle,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.contact.title} — ${siteConfig.brand}`,
      description: dict.contact.subtitle,
    },
  };
}

export default async function ContactPage({
  params,
}: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const breadcrumb = breadcrumbJsonLd([
    { name: dict.nav.home, url: `${siteConfig.url}/${lang}` },
    { name: dict.contact.title, url: `${siteConfig.url}/${lang}/contact` },
  ]);

  return (
    <>
      <PageHeader
        eyebrow={dict.meta.siteName}
        title={dict.contact.title}
        subtitle={dict.contact.subtitle}
      />

      <section className="border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]">
        <div className="container-h2 grid gap-10 py-20 md:grid-cols-[1fr_1.4fr] md:py-28">
          <aside className="flex flex-col gap-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
                {dict.contact.infoTitle}
              </h2>
              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <p className="text-[color:var(--color-foreground-muted)]">
                    {dict.contact.emailLabel}
                  </p>
                  <a
                    href={`mailto:${dict.contact.email}`}
                    className="mt-1 inline-block text-base text-[color:var(--color-foreground)] hover:text-[color:var(--color-accent)]"
                  >
                    {dict.contact.email}
                  </a>
                </li>
                <li>
                  <p className="text-[color:var(--color-foreground-muted)]">
                    {dict.contact.phoneLabel}
                  </p>
                  <a
                    href={`tel:${dict.contact.phone.replace(/\s+/g, "")}`}
                    className="mt-1 inline-block text-base text-[color:var(--color-foreground)] hover:text-[color:var(--color-accent)]"
                  >
                    {dict.contact.phone}
                  </a>
                </li>
                <li>
                  <p className="text-[color:var(--color-foreground-muted)]">
                    {dict.contact.addressLabel}
                  </p>
                  <address className="not-italic mt-1 text-base text-[color:var(--color-foreground)]">
                    {dict.contact.address}
                  </address>
                </li>
              </ul>
            </div>
          </aside>

          <ContactForm dict={dict} />
        </div>
      </section>

      <JsonLd id="ld-contact" data={[contactPageJsonLd(dict, lang), breadcrumb]} />
    </>
  );
}
