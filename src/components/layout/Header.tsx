import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { H2Logo } from "@/components/ui/H2Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { resolveBranding, resolveNav, resolveSite } from "@/lib/site-config";
import type { Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  lang: Locale;
  dict: Dictionary;
};

export function Header({ lang, dict }: Props) {
  const contactHref = `/${lang}/contact`;
  const navigation = resolveNav(dict, lang);
  const branding = resolveBranding(dict);
  const site = resolveSite(dict);
  return (
    <header
      role="banner"
      className="sticky top-0 z-30 border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]/85 backdrop-blur-md"
    >
      <div className="container-h2 flex h-16 items-center justify-between gap-6 md:h-18">
        <Link
          href={`/${lang}`}
          aria-label={`${dict.meta.siteName} — ${dict.nav.home}`}
          className="flex items-center"
        >
          <H2Logo logo={branding.logo} alt={site.brand} />
        </Link>

        <nav
          aria-label={dict.nav.menu}
          className="hidden lg:flex lg:items-center lg:gap-1"
        >
          <NavLinks lang={lang} items={navigation} />
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher current={lang} label={dict.nav.language} />
          <Link
            href={contactHref}
            className="btn-primary hidden px-4 py-2.5 text-sm lg:inline-flex"
          >
            {dict.hero.ctaPrimary}
            <ArrowRightIcon aria-hidden className="h-4 w-4" />
          </Link>
          <MobileMenu
            items={navigation}
            labels={dict.nav as unknown as Record<string, string>}
            ctaLabel={dict.hero.ctaPrimary}
            ctaHref={contactHref}
          />
        </div>
      </div>
    </header>
  );
}
