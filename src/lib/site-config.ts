import type { Locale } from "@/i18n-config";

/**
 * Deployment-level constants. Everything an editor can change (brand name,
 * founder, social profiles) is served from the admin under `site` — read it
 * with `resolveSite(dict)` rather than these defaults, which only stand in
 * when the API has not answered.
 */
export const siteConfig = {
  domain: "h2solutions.az",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://h2solutions.az",
  brand: "H2 Solutions",
  founder: "Hamid Hamidli",
  twitterHandle: "@h2solutions",
  /* Structured-data values: read by the schema.org markup, not shown on a page. */
  addressLocality: "Baku",
  addressCountry: "AZ",
  priceRange: "$$",
  social: {
    linkedin: "https://www.linkedin.com/in/hamidhamidli/",
    github: "https://github.com/",
    twitter: "https://x.com/",
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
  },
};

export type SiteProfile = typeof siteConfig;

type SiteOverrides = {
  site?: {
    brand?: string;
    founder?: string;
    domain?: string;
    twitterHandle?: string;
    addressLocality?: string;
    addressCountry?: string;
    priceRange?: string;
    social?: Partial<SiteProfile["social"]>;
  };
};

/** The admin-managed brand block, with the build-time constants as fallback. */
export function resolveSite(dict: SiteOverrides): SiteProfile {
  const site = dict.site ?? {};

  return {
    ...siteConfig,
    brand: site.brand || siteConfig.brand,
    founder: site.founder || siteConfig.founder,
    domain: site.domain || siteConfig.domain,
    twitterHandle: site.twitterHandle || siteConfig.twitterHandle,
    addressLocality: site.addressLocality || siteConfig.addressLocality,
    addressCountry: site.addressCountry || siteConfig.addressCountry,
    priceRange: site.priceRange || siteConfig.priceRange,
    social: { ...siteConfig.social, ...(site.social ?? {}) },
  };
}

export type NavKey = "home" | "about" | "services" | "portfolio" | "blog" | "contact";

export type NavItem = { key: string; label?: string; href: string; external?: boolean };

/** Fallback menu, used only when the admin menu is empty or unreachable. */
export const navItems: Array<{ key: NavKey; href: (lang: Locale) => string }> = [
  { key: "home", href: (lang) => `/${lang}` },
  { key: "about", href: (lang) => `/${lang}/about` },
  { key: "services", href: (lang) => `/${lang}/services` },
  { key: "portfolio", href: (lang) => `/${lang}/portfolio` },
  { key: "blog", href: (lang) => `/${lang}/blog` },
  { key: "contact", href: (lang) => `/${lang}/contact` },
];

type MenuSource = {
  navigation?: Array<{ label?: string; href?: string; external?: boolean }>;
  nav?: Record<string, string>;
};

/**
 * The menu as managed in the admin, normalised into absolute paths for the
 * current language. Falls back to the built-in routes when no menu is stored.
 */
export function resolveNav(dict: MenuSource, lang: Locale): NavItem[] {
  const managed = (dict.navigation ?? []).filter((item) => item?.href && item?.label);

  if (managed.length === 0) {
    return navItems.map((item) => ({
      key: item.key,
      label: dict.nav?.[item.key],
      href: item.href(lang),
    }));
  }

  return managed.map((item) => {
    const href = item.href as string;
    const external = Boolean(item.external) || /^https?:\/\//.test(href);

    return {
      key: href,
      label: item.label,
      external,
      // Stored as a path under the language prefix: "/" is the homepage.
      href: external ? href : `/${lang}${href === "/" ? "" : href}`,
    };
  });
}

export type Branding = {
  /** Header/footer logo; null keeps the built-in H2 wordmark. */
  logo: string | null;
  /** Vector favicon, when one was uploaded. */
  svg: string | null;
  /** Generated favicon sizes keyed by pixel size, plus `ico`. */
  icons: Record<string, string>;
  themeColor: string;
  backgroundColor: string;
  appName: string;
  appShortName: string;
};

type BrandingSource = {
  branding?: {
    logo?: string | null;
    faviconSvg?: string | null;
    icons?: Record<string, string>;
    themeColor?: string;
    backgroundColor?: string;
    appName?: string;
    appShortName?: string;
  };
};

/**
 * Logo and favicon set as managed in the admin. Everything is optional: with
 * nothing uploaded the site keeps its built-in mark and wordmark.
 */
export function resolveBranding(dict: BrandingSource): Branding {
  const branding = dict.branding ?? {};

  return {
    logo: branding.logo || null,
    svg: branding.faviconSvg || null,
    icons: branding.icons ?? {},
    themeColor: branding.themeColor || "#0d1117",
    backgroundColor: branding.backgroundColor || "#0d1117",
    appName: branding.appName || siteConfig.brand,
    appShortName: branding.appShortName || siteConfig.brand,
  };
}
