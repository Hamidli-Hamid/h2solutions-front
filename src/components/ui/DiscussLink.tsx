import Link from "next/link";
import type { ReactNode } from "react";

import { WhatsAppLink } from "./WhatsAppLink";
import { localePath, type Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";
import { projectChat } from "@/lib/format";

type Props = {
  lang: Locale;
  dict: Dictionary;
  className?: string;
  magnetic?: boolean;
  children: ReactNode;
};

/**
 * Every «discuss a project» button: a WhatsApp chat with the page language's
 * first message (see `WhatsAppLink`). Falls back to the contact page while the
 * admin has no real WhatsApp line.
 */
export function DiscussLink({ lang, dict, className, magnetic, children }: Props) {
  const chat = projectChat(dict.contact);
  const extra = magnetic ? { "data-magnetic": true } : {};

  if (!chat) {
    return (
      <Link href={localePath(lang, "/contact")} className={className} {...extra}>
        {children}
      </Link>
    );
  }

  return (
    <WhatsAppLink number={chat.number} message={chat.message} className={className} {...extra}>
      {children}
    </WhatsAppLink>
  );
}
