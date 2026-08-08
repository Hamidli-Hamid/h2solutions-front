import { Icon } from "@/components/ui/Icon";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

export function ProcessSteps({ dict }: Props) {
  const t = dict.home.process;

  return (
    <section aria-labelledby="process-heading" className="reveal">
      <div className="container-h2 py-12 md:py-14">
        <p className="section-label">{t.label}</p>
        <h2 id="process-heading" className="mt-3 text-2xl font-bold md:text-[1.75rem]">
          {t.title}
        </h2>

        <ol className="relative mt-12 grid gap-8 md:grid-cols-5 md:gap-6">
          {/* Desktop connector — a single line running between the nodes. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-[10%] top-8 hidden h-px bg-linear-to-r from-transparent via-[color:var(--color-border-strong)] to-transparent md:block"
          />

          {t.steps.map((step, index) => (
            <li
              key={step.title}
              className="relative flex items-start gap-5 md:flex-col md:items-center md:gap-0 md:text-center"
            >
              {/* Mobile connector between consecutive nodes. */}
              {index < t.steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-8 top-16 -bottom-8 w-px bg-[color:var(--color-border-strong)] md:hidden"
                />
              )}

              <span
                aria-hidden
                className="relative z-1 flex h-16 w-16 flex-none items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-background-elevated)] text-[color:var(--color-accent)] shadow-[0_0_28px_-14px_var(--color-accent)]"
              >
                <Icon name={step.icon} className="h-6 w-6" />
              </span>

              <div className="md:mt-5">
                <span className="block font-[var(--font-display)] text-sm font-bold tracking-wider text-[color:var(--color-foreground-muted)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-[0.95rem] font-semibold">{step.title}</h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)] md:px-1">
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
