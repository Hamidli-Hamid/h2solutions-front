import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  breadcrumbs?: { items: Crumb[]; label: string };
  /** Actions rendered under the subtitle (CTA buttons). */
  actions?: ReactNode;
  /**
   * Tall hero treatment with its own bordered grid band. Pages wrapped in
   * `.tech-canvas` pass `false` and get the compact header instead — the
   * square grid is still drawn behind it, just without the extra padding.
   */
  withGrid?: boolean;
};

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
  actions,
  withGrid = true,
}: Props) {
  return (
    <header
      className={
        withGrid
          ? "grid-bg border-b border-[color:var(--color-border)]"
          : "hero-grid"
      }
    >
      <div
        className={`container-h2 ${withGrid ? "py-20 md:py-28" : "pt-10 pb-12 md:pt-12 md:pb-14"}`}
      >
        {breadcrumbs && (
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbs.items} label={breadcrumbs.label} />
          </div>
        )}
        {eyebrow && <p className="section-label">{eyebrow}</p>}
        <h1
          className={`text-4xl font-bold md:text-5xl ${withGrid ? "mt-3 lg:text-6xl" : "mt-4"}`}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--color-foreground-soft)] md:text-lg">
            {subtitle}
          </p>
        )}
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </header>
  );
}
