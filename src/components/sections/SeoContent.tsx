import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

export function SeoContent({ dict }: Props) {
  const t = dict.home.seoText;

  return (
    <section aria-labelledby="seo-content-heading" className="reveal">
      <div className="container-h2 py-12 md:py-14">
        <div className="panel p-6 md:p-8">
          <p className="section-label">{t.label}</p>
          <h2
            id="seo-content-heading"
            className="mt-3 text-lg font-semibold md:text-xl"
          >
            {t.title}
          </h2>
          <div className="mt-4 space-y-3 text-[0.8125rem] leading-[1.85] text-[color:var(--color-foreground-soft)] md:text-sm">
            {t.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
