import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { OrbitDecor } from "@/components/ui/OrbitDecor";

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
          : "hero-canvas overflow-hidden"
      }
    >
      {/* The open half of an inner page header carries the orbit motif the
          home hero introduces, so the inner pages read as the same site. */}
      {!withGrid && (
        <OrbitDecor
          className="orbit-in hidden md:block"
          style={{ right: "-11rem", top: "-9rem", width: "46rem", height: "46rem" }}
        />
      )}
      <div
        className={`container-h2 ${withGrid ? "py-20 md:py-28" : "pt-10 pb-14 md:pt-12 md:pb-16"}`}
      >
        {/* The header opens with the same top-to-bottom choreography as the
            home hero: the title and lead are transform-only (`rise-solid`,
            LCP-safe), everything else fades and rises in around them. */}
        {breadcrumbs && (
          <div className="rise mb-7">
            <Breadcrumbs items={breadcrumbs.items} label={breadcrumbs.label} />
          </div>
        )}
        {eyebrow && (
          <p className="section-label rise" style={{ "--d": "60ms" } as React.CSSProperties}>
            {eyebrow}
          </p>
        )}

        {/* Same fluid scale as the home hero, so a landing page and an inner
            page read as one site instead of two type systems. */}
        <h1
          className={`type-display rise-solid text-balance ${eyebrow ? "mt-5" : ""}`}
          style={{ "--d": "80ms" } as React.CSSProperties}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="type-lead rise-solid mt-5 max-w-2xl"
            style={{ "--d": "160ms" } as React.CSSProperties}
          >
            {subtitle}
          </p>
        )}

        <hr
          aria-hidden
          className="rule-gradient rise mt-9 max-w-md"
          style={{ "--d": "240ms" } as React.CSSProperties}
        />

        {actions && (
          <div
            className="rise mt-8 flex flex-wrap gap-3"
            style={{ "--d": "300ms" } as React.CSSProperties}
          >
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
