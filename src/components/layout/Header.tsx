import Link from "next/link";
import { H2Logo } from "@/components/ui/H2Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { navItems } from "@/lib/site-config";
import type { Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  lang: Locale;
  dict: Dictionary;
};

export function Header({ lang, dict }: Props) {
  const contactHref = `/${lang}/contact`;
  return (
    <header
      role="banner"
      className="sticky top-0 z-30 border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]"
    >
      <div className="container-h2 flex h-16 items-center justify-between gap-6">
        <Link
          href={`/${lang}`}
          aria-label={`${dict.meta.siteName} — ${dict.nav.home}`}
          className="flex items-center"
        >
          <H2Logo />
        </Link>

        <nav
          aria-label={dict.nav.menu}
          className="hidden md:flex md:items-center md:gap-1"
        >
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href(lang)}
              className="rounded-md px-3 py-2 text-sm text-[color:var(--color-foreground-soft)] transition hover:text-[color:var(--color-foreground)]"
            >
              {dict.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher current={lang} />
          <Link href={contactHref} className="btn-primary hidden md:inline-flex">
            {dict.hero.ctaPrimary}
          </Link>
          <MobileMenu
            lang={lang}
            labels={dict.nav as unknown as Record<string, string>}
            ctaLabel={dict.hero.ctaPrimary}
            ctaHref={contactHref}
          />
        </div>
      </div>
    </header>
  );
}
