import type { Metadata } from "next";
import Link from "next/link";

import { getDictionary } from "@/lib/dictionaries";
import { i18n } from "@/i18n-config";

/* Next does not pass route params to not-found, so the page speaks the site's
   default language. The copy itself is admin-managed for every locale. */
const lang = i18n.defaultLocale;

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(lang);

  return {
    title: `${dict.notFound.eyebrow} — ${dict.notFound.titleAccent} ${dict.notFound.title}`,
    description: dict.notFound.text,
    robots: { index: false, follow: false },
  };
}

export default async function NotFound() {
  const dict = await getDictionary(lang);
  const t = dict.notFound;

  return (
    <section className="grid-bg flex flex-1 items-center">
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
    </section>
  );
}
