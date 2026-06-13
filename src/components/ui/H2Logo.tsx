type Props = {
  className?: string;
  withWordmark?: boolean;
};

export function H2Logo({ className, withWordmark = true }: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <span
        aria-hidden
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-background-elevated)] font-[var(--font-display)] text-[color:var(--color-accent)] shadow-[var(--shadow-glow)]"
      >
        <span className="text-base font-bold leading-none">H</span>
        <span className="text-[10px] font-bold leading-none translate-y-1">2</span>
      </span>
      {withWordmark && (
        <span className="text-sm font-semibold tracking-wide text-[color:var(--color-foreground)]">
          H2 <span className="text-[color:var(--color-foreground-muted)]">Solutions</span>
        </span>
      )}
    </span>
  );
}
