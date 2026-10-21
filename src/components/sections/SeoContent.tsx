import { SidePicture, type SideImage } from "@/components/sections/FaqAccordion";

/** Shape every SEO text block shares — home, services and any page added later. */
export type SeoTextContent = {
  label: string;
  title: string;
  body: string[];
};

type Props = {
  content: SeoTextContent;
  /** The heading and copy on the left, a picture on the right (home). */
  image?: SideImage;
};

export function SeoContent({ content: t, image }: Props) {
  const paragraphs = (
    <div className="space-y-4 text-[0.875rem] leading-[1.9] text-[color:var(--color-foreground-soft)] md:text-[0.9375rem]">
      {t.body.map((paragraph) => (
        <p key={paragraph.slice(0, 40)}>{paragraph}</p>
      ))}
    </div>
  );

  if (image) {
    return (
      <section aria-labelledby="seo-content-heading" className="reveal">
        <div className="container-h2 py-14 md:py-20">
          <div className="panel grid gap-8 rounded-[var(--radius-xl)] p-6 md:p-10 lg:grid-cols-12 lg:items-center lg:gap-14">
            <div className="lg:col-span-7">
              <p className="section-label">{t.label}</p>
              <h2 id="seo-content-heading" className="type-h3 mt-4 text-balance">
                {t.title}
              </h2>
              <hr aria-hidden className="rule-gradient mb-6 mt-6" />
              {paragraphs}
            </div>
            <div className="lg:col-span-5">
              <SidePicture image={image} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="seo-content-heading" className="reveal">
      <div className="container-h2 py-14 md:py-20">
        {/* Two columns from `lg`: the heading holds the left rail while the
            copy runs down the right, which keeps the measure readable instead
            of stretching a paragraph across the full 92rem container. */}
        <div className="panel grid gap-8 rounded-[var(--radius-xl)] p-6 md:p-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="section-label">{t.label}</p>
            <h2 id="seo-content-heading" className="type-h3 mt-4 text-balance">
              {t.title}
            </h2>
            <hr aria-hidden className="rule-gradient mt-6" />
          </div>

          {paragraphs}
        </div>
      </div>
    </section>
  );
}
