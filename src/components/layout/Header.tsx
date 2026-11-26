import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { DiscussLink } from "@/components/ui/DiscussLink";
import { H2Logo } from "@/components/ui/H2Logo";
import { MARKS } from "@/components/ui/ShareLinks";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { resolveBranding, resolveNav, resolveSite } from "@/lib/site-config";
import { localePath, type Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";
import { projectChat } from "@/lib/format";

type Props = {
  lang: Locale;
  dict: Dictionary;
  /** Passed to the language switcher; see `LanguageSwitcher`. */
  postLocales: Record<string, Locale[]>;
};

export function Header({ lang, dict, postLocales }: Props) {
  const contactHref = localePath(lang, "/contact");
  const navigation = resolveNav(dict, lang);
  const branding = resolveBranding(dict);
  const site = resolveSite(dict);
  const chat = projectChat(dict.contact);
  return (
    <header
      role="banner"
      className="site-header sticky top-0 z-30 border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]/72 backdrop-blur-xl"
    >
      <div className="container-h2 flex h-16 items-center justify-between gap-6 md:h-18">
        <Link
          href={localePath(lang)}
          aria-label={`${dict.meta.siteName} — ${dict.nav.home}`}
          className="flex shrink-0 items-center"
        >
          <H2Logo logo={branding.logo} alt={site.brand} />
        </Link>

        <nav
          aria-label={dict.nav.menu}
          className="hidden xl:flex xl:items-center xl:gap-1"
        >
          <NavLinks lang={lang} items={navigation} />
        </nav>

        <div className="flex items-center gap-1.5 min-[480px]:gap-3">
          <LanguageSwitcher
            current={lang}
            label={dict.nav.language}
            postLocales={postLocales}
          />
          {chat && (
            <WhatsAppLink
              number={chat.number}
              message={chat.message}
              aria-label={`${dict.contact.direct.whatsappCta}: ${chat.display}`}
              title={dict.contact.direct.whatsappCta}
              className="header-wa"
            >
              <span aria-hidden className="header-wa__icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d={MARKS.whatsapp} />
                </svg>
              </span>
              <span className="header-wa__number header-wa__number--full">{chat.display}</span>
              {chat.local && (
                <span className="header-wa__number header-wa__number--short">{chat.local}</span>
              )}
            </WhatsAppLink>
          )}
          <DiscussLink
            lang={lang}
            dict={dict}
            magnetic
            className="btn-primary hidden whitespace-nowrap px-4 py-2.5 text-sm lg:inline-flex"
          >
            <span>{dict.hero.ctaPrimary}</span>
            <ArrowRightIcon aria-hidden className="h-4 w-4" />
          </DiscussLink>
          <MobileMenu
            items={navigation}
            labels={dict.nav as unknown as Record<string, string>}
            ctaLabel={dict.hero.ctaPrimary}
            ctaHref={contactHref}
            chat={chat ? { number: chat.number, message: chat.message } : null}
          />
        </div>
      </div>

      {/* Reading progress, drawn over the header's bottom border. Driven by
          the document's scroll timeline in CSS — no listener, no state, and
          it simply stays at zero width where `scroll()` is unsupported. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px overflow-hidden"
      >
        <div className="scroll-progress h-full w-full" />
      </div>
    </header>
  );
}
