import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

export function WhyUs({ dict }: Props) {
  return (
    <section aria-labelledby="why-heading" className="reveal">
      <div className="container-h2 py-12 md:py-14">
        <p className="section-label">{dict.usp.label}</p>
        <h2 id="why-heading" className="mt-3 text-2xl font-bold md:text-[1.75rem]">
          {dict.usp.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-[color:var(--color-foreground-soft)] md:text-base">
          {dict.usp.subtitle}
        </p>

        <ul className="mt-9 grid gap-5 md:grid-cols-3">
          {dict.usp.items.map((item, index) => (
            <li key={item.title} className="panel flex flex-col p-6">
              <span
                aria-hidden
                className="icon-tile h-10 w-10 font-[var(--font-display)] text-sm font-bold"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-base font-semibold">{item.title}</h3>
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
