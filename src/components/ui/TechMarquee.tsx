type Props = {
  /** Technology names, already localised — see `about.stack.groups`. */
  items: string[];
};

/**
 * Endless ticker of the stack the team builds on.
 *
 * The list is rendered twice inside one track: the animation translates the
 * track by exactly half its width, so the second copy is sitting where the
 * first started when the cycle restarts and the loop has no visible seam.
 * The duplicate is hidden from assistive technology — a screen reader should
 * hear the stack once.
 */
export function TechMarquee({ items }: Props) {
  if (items.length === 0) return null;

  const run = (hidden: boolean) => (
    <ul
      className="flex shrink-0 items-center gap-12"
      {...(hidden ? { "aria-hidden": true } : {})}
    >
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-3 whitespace-nowrap font-[family-name:var(--font-display)] text-sm font-medium tracking-wide text-[color:var(--color-foreground-muted)]"
        >
          <span
            aria-hidden
            className="h-1 w-1 flex-none rounded-full bg-[color:var(--color-accent)]"
          />
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee py-1">
      <div className="marquee-track">
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}
