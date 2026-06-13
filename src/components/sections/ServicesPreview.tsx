import Link from "next/link";
import type { Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";
import type { ApiService } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";

type Props = {
  lang: Locale;
  dict: Dictionary;
  services: ApiService[];
};

export function ServicesPreview({ lang, dict, services }: Props) {
  if (services.length === 0) return null;

  const previewItems = services.slice(0, 3);

  return (
    <section className="border-t border-[color:var(--color-border)] bg-[color:var(--color-background-elevated)]">
      <div className="container-h2 py-20 md:py-28">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold md:text-4xl">
              {dict.servicesPreview.title}
            </h2>
            <p className="mt-3 text-base text-[color:var(--color-foreground-muted)]">
              {dict.servicesPreview.subtitle}
            </p>
          </div>
          <Link
            href={`/${lang}/services`}
            className="hidden text-sm font-medium text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-strong)] md:inline-flex"
          >
            {dict.servicesPreview.viewAll} →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {previewItems.map((service) => (
            <Link
              key={service.slug}
              href={`/${lang}/services/${service.slug}`}
              className="card group flex flex-col p-6 md:p-7"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] text-[color:var(--color-accent)] transition group-hover:shadow-[var(--shadow-glow)]">
                <Icon name={service.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold transition group-hover:text-[color:var(--color-accent)]">
                {service.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[color:var(--color-foreground-muted)]">
                {service.summary}
              </p>
              <span className="mt-6 text-sm font-medium text-[color:var(--color-accent)] opacity-0 transition group-hover:opacity-100">
                {dict.common.learnMore} →
              </span>
            </Link>
          ))}
        </div>

        <Link
          href={`/${lang}/services`}
          className="mt-8 inline-flex text-sm font-medium text-[color:var(--color-accent)] md:hidden"
        >
          {dict.servicesPreview.viewAll} →
        </Link>
      </div>
    </section>
  );
}
