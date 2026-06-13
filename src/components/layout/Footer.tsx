import Link from "next/link";
import { H2Logo } from "@/components/ui/H2Logo";
import { navItems, siteConfig } from "@/lib/site-config";
import type { Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";
import type { ApiService } from "@/lib/api";

type Props = {
  lang: Locale;
  dict: Dictionary;
  services: ApiService[];
};

export function Footer({ lang, dict, services }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="border-t border-[color:var(--color-border)] bg-[color:var(--color-background-elevated)]"
    >
      <div className="container-h2 grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <H2Logo />
          <p className="mt-4 max-w-sm text-sm text-[color:var(--color-foreground-muted)]">
            {dict.footer.tagline}
          </p>
          <div className="mt-6 flex gap-2">
            <a
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] text-[color:var(--color-foreground-soft)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45z" />
              </svg>
            </a>
            <a
              href={siteConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] text-[color:var(--color-foreground-soft)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11 11 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.9 1.2 2 1.2 3.2 0 4.6-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
              </svg>
            </a>
          </div>
        </div>

        <nav aria-label={dict.footer.navTitle}>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-foreground-muted)]">
            {dict.footer.navTitle}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {navItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href(lang)}
                  className="text-[color:var(--color-foreground-soft)] transition hover:text-[color:var(--color-accent)]"
                >
                  {dict.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <nav aria-label={dict.footer.servicesTitle}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-foreground-muted)]">
              {dict.footer.servicesTitle}
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/${lang}/services/${service.slug}`}
                    className="text-[color:var(--color-foreground-soft)] transition hover:text-[color:var(--color-accent)]"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <h2 className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-foreground-muted)]">
            {dict.footer.contactTitle}
          </h2>
          <address className="mt-4 not-italic space-y-1 text-sm text-[color:var(--color-foreground-soft)]">
            <div>
              <a
                href={`mailto:${dict.contact.email}`}
                className="hover:text-[color:var(--color-accent)]"
              >
                {dict.contact.email}
              </a>
            </div>
            <div>
              <a
                href={`tel:${dict.contact.phone.replace(/\s+/g, "")}`}
                className="hover:text-[color:var(--color-accent)]"
              >
                {dict.contact.phone}
              </a>
            </div>
            <div>{dict.contact.address}</div>
          </address>
        </div>
      </div>

      <div className="border-t border-[color:var(--color-border)]">
        <div className="container-h2 flex flex-col items-start justify-between gap-2 py-6 text-xs text-[color:var(--color-foreground-muted)] md:flex-row md:items-center">
          <p>
            © {year} {siteConfig.brand}. {dict.footer.rights}.
          </p>
          <p>
            {dict.footer.madeWith}{" "}
            <span className="text-[color:var(--color-foreground)]">
              {siteConfig.founder}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
