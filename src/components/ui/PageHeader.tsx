import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { OrbitDecor } from "@/components/ui/OrbitDecor";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  breadcrumbs?: { items: Crumb[]; label: string };
  /** Facts under the subtitle (an article's date and reading time). */
  meta?: ReactNode;
  /** Actions rendered under the rule (CTA buttons). */
  actions?: ReactNode;
};

/**
 * The opening band of every inner page. It has no bottom padding of its own:
 * the first `.section` under it supplies one `--section-y`, so the step from a
 * header to its content is the same on every page.
 */
export function PageHeader({ eyebrow, title, subtitle, breadcrumbs, meta, actions }: Props) {
  return (
    <header className="hero-canvas overflow-hidden">
      {/* The open half of an inner page header carries the orbit motif the
          home hero introduces, so the inner pages read as the same site. */}
      <OrbitDecor
        className="orbit-in hidden md:block"
        style={{ right: "-11rem", top: "-9rem", width: "46rem", height: "46rem" }}
      />
      <div className="container-h2 pt-8 md:pt-10 lg:pt-12">
        {/* The header opens with the same top-to-bottom choreography as the
            home hero: the title and lead are transform-only (`rise-solid`,
            LCP-safe), everything else fades and rises in around them. */}
        {breadcrumbs && (
          <div className="rise mb-6 md:mb-7">
            <Breadcrumbs items={breadcrumbs.items} label={breadcrumbs.label} />
          </div>
        )}
        {eyebrow && (
          <p className="section-label rise" style={{ "--d": "60ms" } as React.CSSProperties}>
            {eyebrow}
          </p>
        )}

        <h1
          className={`type-h1 rise-solid max-w-5xl text-balance ${eyebrow ? "mt-4" : ""}`}
          style={{ "--d": "80ms" } as React.CSSProperties}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="type-lead rise-solid mt-5 max-w-2xl text-pretty"
            style={{ "--d": "160ms" } as React.CSSProperties}
          >
            {subtitle}
          </p>
        )}

        {meta && (
          <div className="rise mt-5" style={{ "--d": "200ms" } as React.CSSProperties}>
            {meta}
          </div>
        )}

        <hr
          aria-hidden
          className="rule-gradient rise mt-8 max-w-md"
          style={{ "--d": "240ms" } as React.CSSProperties}
        />

        {actions && (
          <div
            className="rise mt-7 flex flex-wrap items-center gap-3 max-sm:[&>.btn-primary]:w-full max-sm:[&>.btn-secondary]:w-full"
            style={{ "--d": "300ms" } as React.CSSProperties}
          >
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
