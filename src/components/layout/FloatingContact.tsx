import { PhoneIcon } from "@heroicons/react/24/solid";

import { MARKS } from "@/components/ui/ShareLinks";
import type { Dictionary } from "@/lib/dictionaries";
import { contactNumbers, telHref, whatsappHref } from "@/lib/format";

type Props = {
  dict: Dictionary;
};

/**
 * Call and WhatsApp, pinned to the bottom-right corner of every page. The
 * numbers are the admin's contact lines (see `contactNumbers`): a button is
 * left out while its line is missing or still the placeholder, so the corner
 * never offers a number that rings nowhere. Call sits above WhatsApp, which
 * keeps the chat — the one people reach for — nearest the thumb.
 */
export function FloatingContact({ dict }: Props) {
  const t = dict.contact;
  const { phone, whatsapp } = contactNumbers(t);
  if (!phone && !whatsapp) return null;

  return (
    <nav aria-label={t.infoTitle} className="float-contact">
      {phone && (
        <a
          href={telHref(phone)}
          aria-label={`${t.phoneLabel}: ${phone}`}
          title={phone}
          className="float-contact__btn float-contact__btn--call"
        >
          <PhoneIcon aria-hidden className="h-5 w-5" />
        </a>
      )}
      {whatsapp && (
        <a
          href={whatsappHref(whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.direct.whatsappCta}
          title={t.direct.whatsappCta}
          className="float-contact__btn float-contact__btn--whatsapp"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
            <path d={MARKS.whatsapp} />
          </svg>
        </a>
      )}
    </nav>
  );
}
