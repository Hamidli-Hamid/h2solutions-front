import Link from "next/link";
import type { Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  lang: Locale;
  dict: Dictionary;
};

export function CtaBanner({ lang, dict }: Props) {
  return (
    <section className="border-t border-[color:var(--color-border)] bg-[color:var(--color-background)]">
      <div className="container-h2 py-20 md:py-28">
        <div className="card relative overflow-hidden p-8 md:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-[color:var(--color-accent)] opacity-20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -bottom-32 h-72 w-72 rounded-full bg-[color:var(--color-accent-deep)] opacity-25 blur-3xl"
          />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">
                {dict.contact.title}.{" "}
                <span className="accent-text">{dict.common.getStarted}</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm text-[color:var(--color-foreground-soft)] md:text-base">
                {dict.contact.subtitle}
              </p>
            </div>
            <Link href={`/${lang}/contact`} className="btn-primary self-start">
              {dict.hero.ctaPrimary}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
