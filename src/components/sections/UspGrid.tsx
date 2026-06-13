import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

export function UspGrid({ dict }: Props) {
  return (
    <section className="border-t border-[color:var(--color-border)] bg-[color:var(--color-background)]">
      <div className="container-h2 py-20 md:py-28">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold md:text-4xl">{dict.usp.title}</h2>
          <p className="mt-3 text-base text-[color:var(--color-foreground-muted)]">
            {dict.usp.subtitle}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {dict.usp.items.map((item, i) => (
            <article key={i} className="card p-6 md:p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] text-[color:var(--color-accent)]">
                <span className="font-[var(--font-display)] text-sm font-bold">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-foreground-muted)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
