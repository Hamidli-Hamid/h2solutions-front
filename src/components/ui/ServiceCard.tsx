import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { CardLink } from "@/components/ui/CardLink";
import { Icon } from "@/components/ui/Icon";
import { localePath, type Locale } from "@/i18n-config";
import type { ApiService } from "@/lib/api";

type Props = {
  service: ApiService;
  lang: Locale;
  ctaLabel: string;
  /** Heading level so the card fits the surrounding document outline. */
  headingLevel?: "h2" | "h3";
  /** Feature bullets shown under the summary; 0 hides them. */
  featureCount?: number;
  /** Position in the list — drawn as a small ordinal in the corner. */
  index?: number;
};

export function ServiceCard({
  service,
  lang,
  ctaLabel,
  headingLevel: Heading = "h2",
  featureCount = 3,
  index,
}: Props) {
  const features = service.features.slice(0, featureCount);
  const href = localePath(lang, `/services/${service.slug}`);

  return (
    <article
      data-glow
      className="panel panel-interactive glow-card sheen group flex h-full flex-col p-6 md:p-7"
    >
      <span className="flex items-start justify-between">
        <span aria-hidden className="icon-tile h-12 w-12">
          <Icon name={service.icon} className="h-5.5 w-5.5" />
        </span>
        {index !== undefined && (
          <span
            aria-hidden
            className="font-[family-name:var(--font-display)] text-sm font-bold tracking-wider text-[color:var(--color-foreground-faint)] transition group-hover:text-[color:var(--color-accent)]"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </span>

      <Heading className="type-h3 mt-6">
        <Link
          href={href}
          className="transition group-hover:text-[color:var(--color-accent)]"
        >
          {service.title}
        </Link>
      </Heading>

      <p
        className={`mt-3 text-sm leading-relaxed text-[color:var(--color-foreground-soft)] ${
          features.length === 0 ? "flex-1" : ""
        }`}
      >
        {service.summary}
      </p>

      {features.length > 0 && (
        <ul className="mt-6 flex-1 space-y-2.5 border-t border-[color:var(--color-border)] pt-6 text-[0.8125rem] text-[color:var(--color-foreground-soft)]">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <span
                aria-hidden
                className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-[image:linear-gradient(100deg,var(--color-accent),var(--color-accent-alt-soft))]"
              />
              {feature}
            </li>
          ))}
        </ul>
      )}

      <span
        aria-hidden
        className="mt-7 inline-flex items-center gap-2 text-[0.8125rem] font-medium text-[color:var(--color-accent)]"
      >
        {ctaLabel}
        <span className="arrow-chip h-6 w-6">
          <ArrowRightIcon className="h-3 w-3" />
        </span>
      </span>

      <CardLink href={href} />
    </article>
  );
}
