import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Space_Grotesk } from "next/font/google";

import "./globals.css";

import { getDictionary } from "@/lib/dictionaries";
import { i18n } from "@/i18n-config";

/**
 * The 404 for URLs that match no route at all. The site's root layout lives
 * under `[lang]`, so Next cannot compose a normal not-found page from it — this
 * file returns the whole document instead (see next.config.ts:globalNotFound).
 *
 * Route params do not exist here, so the page speaks the site's default
 * language; the copy itself is editable per language in the admin.
 */
const lang = i18n.defaultLocale;

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

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(lang);

  return {
    title: `${dict.notFound.eyebrow} — ${dict.notFound.titleAccent} ${dict.notFound.title}`,
    description: dict.notFound.text,
    robots: { index: false, follow: false },
  };
}

export default async function GlobalNotFound() {
  const dict = await getDictionary(lang);
  const t = dict.notFound;

  return (
    <html
      lang={lang}
      dir="ltr"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[color:var(--color-background)] text-[color:var(--color-foreground)]">
        <main className="grid-bg flex flex-1 items-center">
          <div className="container-h2 py-24 md:py-32">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
              {t.eyebrow}
            </p>
            <h1 className="mt-3 text-5xl font-bold md:text-6xl lg:text-7xl">
              <span className="accent-text">{t.titleAccent}</span> {t.title}
            </h1>
            <p className="mt-4 max-w-xl text-base text-[color:var(--color-foreground-soft)] md:text-lg">
              {t.text}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={`/${lang}`} className="btn-primary">
                {t.ctaLabel}
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
