type Props = {
  className?: string;
  withWordmark?: boolean;
  /** Logo uploaded in the admin; without one the built-in mark is drawn. */
  logo?: string | null;
  /** Accessible name for an uploaded logo — normally the brand name. */
  alt?: string;
};

export function H2Logo({ className, withWordmark = true, logo, alt }: Props) {
  if (logo) {
    /* An uploaded logo replaces the whole lockup, mark and wordmark alike.
       Height is fixed to the header rhythm; the width follows the artwork. */
    return (
      /* eslint-disable-next-line @next/next/no-img-element --
         arbitrary admin artwork of unknown intrinsic size, which next/image
         requires; it is a small header asset, so optimisation buys little. */
      <img
        src={logo}
        alt={alt ?? ""}
        className={`h-9 w-auto max-w-[12rem] object-contain ${className ?? ""}`}
      />
    );
  }

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
