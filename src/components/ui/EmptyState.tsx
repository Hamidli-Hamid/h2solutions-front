import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

type Props = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function EmptyState({ icon: IconComponent, title, description, ctaLabel, ctaHref }: Props) {
  return (
    <div className="card relative overflow-hidden p-10 md:p-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[color:var(--color-accent)] opacity-10 blur-3xl"
      />
      <div className="relative flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] text-[color:var(--color-accent)] shadow-[var(--shadow-glow)]">
          <IconComponent className="h-6 w-6" aria-hidden />
        </div>
        <h3 className="mt-6 text-xl font-semibold">{title}</h3>
        <p className="mt-3 max-w-md text-sm text-[color:var(--color-foreground-soft)]">
          {description}
        </p>
        {ctaLabel && ctaHref && (
          <Link href={ctaHref} className="btn-secondary mt-6">
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
