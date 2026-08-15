import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";

import "../globals.css";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from "@/components/analytics/GoogleTagManager";
import { getDictionary } from "@/lib/dictionaries";
import {
  resolveBranding,
  resolveSite,
  siteConfig,
  type Branding,
} from "@/lib/site-config";
import { getPageSeo } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { i18n, isLocale } from "@/i18n-config";
import { fetchServices } from "@/lib/api";
import {
  organizationJsonLd,
  websiteJsonLd,
  professionalServiceJsonLd,
} from "@/lib/jsonld";

/* Body copy and the hero heading are both above the fold, so both families stay
   preloaded — but `subsets` only decides what goes on the critical path, not
   what is available: next/font emits an @font-face for every cut either way.
   Cyrillic is therefore left out. Four of the six locales would never render a
   glyph from it, and ru/kk still get it, fetched on demand once `unicode-range`
   matches. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/* Space Grotesk has no Cyrillic cut at all; ru/kk headings fall through to
   Inter via the `--font-display` stack. */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/** The browser-UI colour follows the theme colour set in the admin. */
export async function generateViewport({
  params,
}: LayoutProps<"/[lang]">): Promise<Viewport> {
  const { lang } = await params;
  const dict = await getDictionary(isLocale(lang) ? lang : i18n.defaultLocale);
  const { themeColor } = resolveBranding(dict);

  return {
    /* One colour, no media split: the site renders dark in both schemes, so
       two identical entries only told the browser the same thing twice. */
    themeColor,
    colorScheme: "dark",
    width: "device-width",
    initialScale: 1,
  };
}

export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);
  const site = resolveSite(dict);
  const branding = resolveBranding(dict);

  /* The site-wide defaults: the `layout` page row in the admin, with the
     homepage row on top of it, so editing either lands here. */
  const [layoutSeo, homeSeo] = await Promise.all([
    getPageSeo(lang, "layout"),
    getPageSeo(lang, "home"),
  ]);
  const seo = { ...layoutSeo, ...homeSeo };

  const defaultTitle = `${dict.meta.siteName} — ${dict.meta.tagline}`;

  const base = buildMetadata({
    lang,
    path: "",
    title: defaultTitle,
    description: dict.meta.defaultDescription,
    seo: Object.keys(seo).length > 0 ? seo : null,
    absoluteTitle: true,
  });

  return {
    ...base,
    metadataBase: new URL(siteConfig.url),
    // Child routes append the brand; the layout itself carries the full title.
    title: {
      default: seo.title || defaultTitle,
      template: `%s — ${dict.meta.siteName}`,
    },
    applicationName: dict.meta.siteName,
    authors: [{ name: site.founder, url: site.social.linkedin }],
    creator: site.founder,
    publisher: dict.meta.siteName,
    category: "technology",
    /* Ownership proofs for the webmaster consoles. They have to stay on every
       indexable route: each console re-checks the tag periodically and drops
       the property when it stops finding it. Bing has no dedicated field, so
       `msvalidate.01` goes through `other`, whose keys become meta names. */
    verification: {
      yandex: "08c85d38ca8cf549",
      other: { "msvalidate.01": "88789CB6C61874F3854CC07A77F1DA20" },
    },
    referrer: "origin-when-cross-origin",
    formatDetection: { telephone: false, email: false, address: false },
    ...brandedIcons(branding),
    twitter: {
      ...base.twitter,
      creator: site.twitterHandle,
      site: site.twitterHandle,
    },
    robots: base.robots ?? {
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

/**
 * The built-in mark, as the files `scripts/generate-icons.mjs` writes into
 * `public/`. Ordered the way browsers read the list: the legacy container
 * first, then the vector modern engines prefer, then the raster fallbacks.
 */
const DEFAULT_ICONS: Metadata["icons"] = {
  icon: [
    { url: "/favicon.ico", sizes: "any" },
    { url: "/favicon.svg", type: "image/svg+xml" },
    { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    // Google Search reads the 48px one when picking a result icon.
    { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
  ],
  apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
};

/**
 * Icon links for an uploaded favicon set, falling back to the built-in mark.
 */
function brandedIcons(branding: Branding): Pick<Metadata, "icons"> {
  const { icons, svg } = branding;

  // The generated PNG set is what makes an override complete; an SVG on its
  // own would leave iOS and older browsers without an icon.
  if (!icons["32"]) return { icons: DEFAULT_ICONS };

  const png = ["16", "32", "48", "96", "192", "512"]
    .filter((size) => icons[size])
    .map((size) => ({
      url: icons[size],
      sizes: `${size}x${size}`,
      type: "image/png",
    }));

  return {
    icons: {
      icon: [
        // Served by the /favicon.ico route, which redirects to the upload.
        { url: "/favicon.ico", sizes: "any" },
        ...(svg ? [{ url: svg, type: "image/svg+xml" }] : []),
        ...png,
      ],
      apple: ["180", "167", "152", "120"]
        .filter((size) => icons[size])
        .map((size) => ({ url: icons[size], sizes: `${size}x${size}` })),
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
      <GoogleTagManager />
      <body className="flex min-h-full flex-col bg-[color:var(--color-background)] text-[color:var(--color-foreground)]">
        <GoogleTagManagerNoScript />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[color:var(--color-accent)] focus:px-4 focus:py-2 focus:font-semibold focus:text-[#001019]"
        >
          {dict.common.skipToContent}
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
