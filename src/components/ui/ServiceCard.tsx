import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/i18n-config";
import type { ApiService } from "@/lib/api";

type Props = {
  service: ApiService;
  lang: Locale;
  ctaLabel: string;
  /** Heading level so the card fits the surrounding document outline. */
  headingLevel?: "h2" | "h3";
  /** Feature bullets shown under the summary; 0 hides them. */
  featureCount?: number;
};

export function ServiceCard({
  service,
  lang,
  ctaLabel,
  headingLevel: Heading = "h2",
  featureCount = 3,
}: Props) {
  const features = service.features.slice(0, featureCount);

  return (
    <article className="panel panel-interactive group flex h-full flex-col p-6">
      <span
        aria-hidden
        className="icon-tile h-11 w-11 transition group-hover:shadow-[var(--shadow-glow)]"
      >
        <Icon name={service.icon} className="h-5 w-5" />
      </span>

      <Heading className="mt-5 text-lg font-semibold">
        <Link
          href={`/${lang}/services/${service.slug}`}
          className="transition before:absolute before:inset-0 before:content-[''] group-hover:text-[color:var(--color-accent)]"
        >
          {service.title}
        </Link>
      </Heading>

      <p
        className={`mt-2.5 text-sm leading-relaxed text-[color:var(--color-foreground-soft)] ${
          features.length === 0 ? "flex-1" : ""
        }`}
      >
        {service.summary}
      </p>

      {features.length > 0 && (
        <ul className="mt-5 flex-1 space-y-2 border-t border-[color:var(--color-border)] pt-5 text-[0.8125rem] text-[color:var(--color-foreground-soft)]">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <span
                aria-hidden
                className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-[color:var(--color-accent)]"
              />
              {feature}
            </li>
          ))}
        </ul>
      )}

      <span
        aria-hidden
        className="mt-6 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-[color:var(--color-accent)]"
      >
        {ctaLabel}
        <ArrowRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </article>
  );
}
