import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
  /** Ordinal beside the label; the home page passes its own when a section before it is hidden. */
  index?: number;
};

export function ProcessSteps({ dict, index = 2 }: Props) {
  const t = dict.home.process;

  return (
    <section aria-labelledby="process-heading" className="band reveal">
      <div className="container-h2 py-14 md:py-20">
        <SectionHeading
          id="process-heading"
          label={t.label}
          title={t.title}
          index={index}
        />

        <ol className="relative mt-14 grid gap-10 md:grid-cols-5 md:gap-6">
          {/* Desktop connector. Two layers: a static hairline that is always
              there, and the gradient that draws itself across as the band
              scrolls into view. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-[10%] top-8 hidden h-px bg-[color:var(--color-border)] md:block"
          />
          <span
            aria-hidden
            className="line-grow pointer-events-none absolute inset-x-[10%] top-8 hidden h-px md:block"
          />

          {t.steps.map((step, position) => (
            <li
              key={step.title}
              className="reveal-item group relative flex items-start gap-5 md:flex-col md:items-center md:gap-0 md:text-center"
            >
              {/* Mobile connector between consecutive nodes. */}
              {position < t.steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-8 top-16 -bottom-10 w-px bg-[color:var(--color-border-strong)] md:hidden"
                />
              )}

              <span
                aria-hidden
                className="icon-tile relative z-1 h-16 w-16 flex-none rounded-full border-[color:var(--color-border-strong)] bg-[color:var(--color-background-elevated)] shadow-[0_0_28px_-14px_var(--color-accent)] transition duration-300 group-hover:scale-110 group-hover:border-transparent group-hover:bg-[image:linear-gradient(135deg,var(--h2-fill-from),var(--h2-fill-to))] group-hover:text-[color:var(--color-on-accent)] group-hover:shadow-[var(--shadow-glow)] motion-reduce:group-hover:scale-100"
              >
                <Icon name={step.icon} className="h-6 w-6" />
              </span>

              <div className="md:mt-6">
                {/* The ordinal stays in flow rather than behind the node: as
                    an absolute watermark it collided with the icon circle at
                    every breakpoint. */}
                <span aria-hidden className="step-ordinal block select-none">
                  {String(position + 1).padStart(2, "0")}
                </span>

                <h3 className="mt-2 text-[0.95rem] font-semibold md:text-base">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)] md:px-1">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
