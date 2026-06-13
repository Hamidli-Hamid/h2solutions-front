import type { Locale } from "@/i18n-config";

export const siteConfig = {
  domain: "h2solutions.az",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://h2solutions.az",
  brand: "H2 Solutions",
  founder: "Hamid Hamidli",
  social: {
    linkedin: "https://www.linkedin.com/in/hamidhamidli/",
    github: "https://github.com/",
    twitter: "https://x.com/",
  },
};

export type NavKey = "home" | "about" | "services" | "portfolio" | "blog" | "contact";

export const navItems: Array<{ key: NavKey; href: (lang: Locale) => string }> = [
  { key: "home", href: (lang) => `/${lang}` },
  { key: "about", href: (lang) => `/${lang}/about` },
  { key: "services", href: (lang) => `/${lang}/services` },
  { key: "portfolio", href: (lang) => `/${lang}/portfolio` },
  { key: "blog", href: (lang) => `/${lang}/blog` },
  { key: "contact", href: (lang) => `/${lang}/contact` },
];
