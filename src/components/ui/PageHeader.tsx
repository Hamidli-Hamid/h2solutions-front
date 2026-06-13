type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function PageHeader({ eyebrow, title, subtitle }: Props) {
  return (
    <header className="grid-bg border-b border-[color:var(--color-border)]">
      <div className="container-h2 py-20 md:py-28">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 text-4xl font-bold md:text-5xl lg:text-6xl">{title}</h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-base text-[color:var(--color-foreground-soft)] md:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
