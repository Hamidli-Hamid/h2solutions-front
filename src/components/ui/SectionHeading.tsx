import type { ReactNode } from "react";

import { SplitWords } from "@/components/ui/SplitWords";

type Props = {
  /** Small uppercase label above the title. */
  label: string;
  title: string;
  id?: string;
  /** Sentence under the title; omitted on the denser sections. */
  subtitle?: string;
  /** Ordinal drawn beside the label — "01", "02", … */
  index?: number;
  /** Right-aligned action, normally the "view all" link. */
  action?: ReactNode;
  className?: string;
};

/**
 * The heading block every homepage section opens with: label, ordinal,
 * title, optional lead, and a gradient rule that closes the block. Having
 * one component for it is what keeps the vertical rhythm identical from
 * section to section — it used to be copy-pasted markup that drifted.
 *
 * The title is split into words so it rises in word by word as the section
 * scrolls into view. With an ordinal and no action the number is also drawn
 * large and outlined behind the right edge of the block; with an action that
 * corner belongs to the button, so only the small ordinal stays.
 */
export function SectionHeading({
  label,
  title,
  id,
  subtitle,
  index,
  action,
  className,
}: Props) {
  const ordinal = index !== undefined ? String(index).padStart(2, "0") : null;

  return (
    <div className={`relative ${className ?? ""}`}>
      {ordinal && !action && (
        <span aria-hidden className="ghost-ordinal hidden lg:block">
          {ordinal}
        </span>
      )}

      <div className="relative z-1 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4">
            <p className="section-label">{label}</p>
            {ordinal && (
              <span
                aria-hidden
                className="font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold tracking-[0.18em] text-[color:var(--color-foreground-faint)]"
              >
                {ordinal}
              </span>
            )}
          </div>

          <h2 id={id} className="type-h2 mt-4 text-balance">
            <SplitWords text={title} />
          </h2>

          {subtitle && (
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-[color:var(--color-foreground-soft)] md:text-base">
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      <hr aria-hidden className="rule-gradient mt-7" />
    </div>
  );
}
