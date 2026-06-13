import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";

import "../globals.css";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { siteConfig } from "@/lib/site-config";
import { i18n, isLocale } from "@/i18n-config";
import { fetchServices } from "@/lib/api";
import {
  organizationJsonLd,
  websiteJsonLd,
  professionalServiceJsonLd,
} from "@/lib/jsonld";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
    { media: "(prefers-color-scheme: light)", color: "#0d1117" },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);
  const languagesMap = Object.fromEntries(
    i18n.locales.map((locale) => [locale, `${siteConfig.url}/${locale}`]),
  );

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${dict.meta.siteName} — ${dict.meta.tagline}`,
      template: `%s — ${dict.meta.siteName}`,
    },
    description: dict.meta.defaultDescription,
    keywords: dict.meta.keywords,
    applicationName: dict.meta.siteName,
    authors: [{ name: siteConfig.founder, url: siteConfig.social.linkedin }],
    creator: siteConfig.founder,
    publisher: dict.meta.siteName,
    category: "technology",
    referrer: "origin-when-cross-origin",
    formatDetection: { telephone: false, email: false, address: false },
    alternates: {
      canonical: `${siteConfig.url}/${lang}`,
      languages: {
        ...languagesMap,
        "x-default": `${siteConfig.url}/${i18n.defaultLocale}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: dict.meta.siteName,
      title: `${dict.meta.siteName} — ${dict.meta.tagline}`,
      description: dict.meta.defaultDescription,
      url: `${siteConfig.url}/${lang}`,
      locale: lang === "az" ? "az_AZ" : lang === "ru" ? "ru_RU" : "en_US",
      alternateLocale: i18n.locales
        .filter((l) => l !== lang)
        .map((l) => (l === "az" ? "az_AZ" : l === "ru" ? "ru_RU" : "en_US")),
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.meta.siteName} — ${dict.meta.tagline}`,
      description: dict.meta.defaultDescription,
      creator: "@h2solutions",
      site: "@h2solutions",
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, services] = await Promise.all([
    getDictionary(lang),
    fetchServices(lang),
  ]);

  return (
    <html
      lang={lang}
      dir="ltr"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[color:var(--color-background)] text-[color:var(--color-foreground)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[color:var(--color-accent)] focus:px-4 focus:py-2 focus:font-semibold focus:text-[#001019]"
        >
          {dict.common.back === "Geri"
            ? "Əsas məzmuna keç"
            : dict.common.back === "Назад"
              ? "Перейти к содержимому"
              : "Skip to main content"}
        </a>
        <Header lang={lang} dict={dict} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer lang={lang} dict={dict} services={services} />
        <JsonLd
          id="ld-site"
          data={[
            organizationJsonLd(dict, lang),
            websiteJsonLd(dict, lang),
            professionalServiceJsonLd(dict, lang),
          ]}
        />
      </body>
    </html>
  );
}
