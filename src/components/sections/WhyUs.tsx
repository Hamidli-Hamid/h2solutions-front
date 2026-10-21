import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

export function WhyUs({ dict }: Props) {
  return (
    <section aria-labelledby="why-heading" className="reveal">
      <div className="container-h2 py-14 md:py-20">
        <SectionHeading
          id="why-heading"
          label={dict.usp.label}
          title={dict.usp.title}
          subtitle={dict.usp.subtitle}
        />

        <ul className="mt-9 grid gap-4 md:grid-cols-3 md:gap-5">
          {dict.usp.items.map((item, index) => (
            <li
              key={item.title}
              data-glow
              className="panel panel-interactive glow-card sheen reveal-item group flex flex-col p-6 md:p-7"
            >
              <span aria-hidden className="step-ordinal select-none">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-base font-semibold md:text-[1.0625rem]">
                {item.title}
              </h3>
              <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
