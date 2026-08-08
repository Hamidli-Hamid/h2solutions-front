import Link from "next/link";
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";

import { H2Logo } from "@/components/ui/H2Logo";
import { NewsletterForm } from "./NewsletterForm";
import {
  resolveBranding,
  resolveNav,
  resolveSite,
  type SiteProfile,
} from "@/lib/site-config";
import type { Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";
import type { ApiService } from "@/lib/api";

type Props = {
  lang: Locale;
  dict: Dictionary;
  services: ApiService[];
};

const SOCIAL_PATHS: Array<{ label: string; href: (c: SiteProfile) => string; d: string }> = [
  {
    label: "Facebook",
    href: (c) => c.social.facebook,
    d: "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.63c-.29-.04-1.28-.13-2.43-.13-2.4 0-4.05 1.47-4.05 4.17V9.9H7.5V13h2.72v8h3.28z",
  },
  {
    label: "LinkedIn",
    href: (c) => c.social.linkedin,
    d: "M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45z",
  },
  {
    label: "Instagram",
    href: (c) => c.social.instagram,
    d: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.28a6.56 6.56 0 1 0 0 13.12 6.56 6.56 0 0 0 0-13.12zm0 10.82a4.26 4.26 0 1 1 0-8.52 4.26 4.26 0 0 1 0 8.52zm8.35-11.08a1.53 1.53 0 1 1-3.06 0 1.53 1.53 0 0 1 3.06 0z",
  },
  {
    label: "GitHub",
    href: (c) => c.social.github,
    d: "M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11 11 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.9 1.2 2 1.2 3.2 0 4.6-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3",
  },
];

export function Footer({ lang, dict, services }: Props) {
  const year = new Date().getFullYear();
  const site = resolveSite(dict);
  const navigation = resolveNav(dict, lang);
  const branding = resolveBranding(dict);

  /* Prefer the services published in the CMS; fall back to the core service
     list so the column is never empty. */
  const serviceLinks =
    services.length > 0
      ? services.map((service) => ({
          label: service.title,
          href: `/${lang}/services/${service.slug}`,
        }))
      : dict.hero.services.map((service) => ({
          label: service.name,
          href: `/${lang}/services`,
        }));

  return (
    <footer
      role="contentinfo"
      className="border-t border-[color:var(--color-border)] bg-[color:var(--color-background-elevated)]"
    >
      <div className="container-h2 grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.1fr_1.1fr_1.3fr] lg:gap-8">
        <div>
          <H2Logo logo={branding.logo} alt={site.brand} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[color:var(--color-foreground-soft)]">
            {dict.footer.tagline}
          </p>
          <div className="mt-6 flex gap-2">
            {SOCIAL_PATHS.filter((social) => social.href(site)).map((social) => (
              <a
                key={social.label}
                href={social.href(site)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] text-[color:var(--color-foreground-soft)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d={social.d} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <nav aria-label={dict.footer.navTitle}>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-foreground)]">
            {dict.footer.navTitle}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {navigation.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  {...(item.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="text-[color:var(--color-foreground-soft)] transition hover:text-[color:var(--color-accent)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={dict.footer.servicesTitle}>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-foreground)]">
            {dict.footer.servicesTitle}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {serviceLinks.map((service) => (
              <li key={service.label}>
                <Link
                  href={service.href}
                  className="text-[color:var(--color-foreground-soft)] transition hover:text-[color:var(--color-accent)]"
                >
                  {service.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-foreground)]">
            {dict.footer.contactTitle}
          </h2>
          <address className="mt-4 space-y-2.5 text-sm not-italic text-[color:var(--color-foreground-soft)]">
            <div className="flex items-center gap-2.5">
              <PhoneIcon
                aria-hidden
                className="h-4 w-4 flex-none text-[color:var(--color-accent)]"
              />
              <a
                href={`tel:${dict.contact.phone.replace(/\s+/g, "")}`}
                className="transition hover:text-[color:var(--color-accent)]"
              >
                {dict.contact.phone}
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <EnvelopeIcon
                aria-hidden
                className="h-4 w-4 flex-none text-[color:var(--color-accent)]"
              />
              <a
                href={`mailto:${dict.contact.email}`}
                className="transition hover:text-[color:var(--color-accent)]"
              >
                {dict.contact.email}
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPinIcon
                aria-hidden
                className="h-4 w-4 flex-none text-[color:var(--color-accent)]"
              />
              {dict.contact.address}
            </div>
          </address>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-foreground)]">
            {dict.footer.newsletterTitle}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[color:var(--color-foreground-muted)]">
            {dict.footer.newsletterText}
          </p>
          <NewsletterForm lang={lang} dict={dict} />
        </div>
      </div>

      <div className="border-t border-[color:var(--color-border)]">
        <div className="container-h2 flex flex-col items-start justify-between gap-2 py-6 text-xs text-[color:var(--color-foreground-muted)] md:flex-row md:items-center">
          <p>
            © {year} {site.brand}. {dict.footer.rights}.
          </p>
          <p>
            {dict.footer.madeWith}{" "}
            <span className="text-[color:var(--color-foreground)]">
              {site.founder}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
