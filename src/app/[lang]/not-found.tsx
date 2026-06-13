import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 — Səhifə tapılmadı",
  description: "Axtardığınız səhifə mövcud deyil və ya köçürülüb.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="grid-bg flex flex-1 items-center">
      <div className="container-h2 py-24 md:py-32">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
          404
        </p>
        <h1 className="mt-3 text-5xl font-bold md:text-6xl lg:text-7xl">
          <span className="accent-text">Yox</span> belə bir səhifə
        </h1>
        <p className="mt-4 max-w-xl text-base text-[color:var(--color-foreground-soft)] md:text-lg">
          Axtardığınız səhifə yoxdur və ya köçürülüb. The page may have moved or
          never existed. Запрошенная страница не найдена.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn-primary">
            Ana səhifə · Home · Главная
          </Link>
        </div>
      </div>
    </section>
  );
}
