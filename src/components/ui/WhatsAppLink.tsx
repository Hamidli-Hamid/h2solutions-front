"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

import { whatsappHref, whatsappWebHref } from "@/lib/format";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel"> & {
  number: string;
  message?: string;
};

/**
 * A link that opens a WhatsApp chat with a ready-made first message: the app
 * on a phone or tablet, WhatsApp Web in a desktop browser.
 *
 * The rendered href is wa.me — it works without JavaScript and is what a
 * crawler sees. The click picks the device's own target: wa.me hands a phone
 * straight to the app, but on a desktop it stops on an "open the app?" page,
 * so a desktop click goes to web.whatsapp.com instead. A modified click
 * (new tab, new window) is left to the browser.
 */
export function WhatsAppLink({ number, message, onClick, children, ...rest }: Props) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    if (isHandheld()) {
      window.location.href = whatsappHref(number, message);
    } else {
      window.open(whatsappWebHref(number, message), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <a
      {...rest}
      href={whatsappHref(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
    >
      {children}
    </a>
  );
}

function isHandheld(): boolean {
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
  if (typeof nav.userAgentData?.mobile === "boolean" && nav.userAgentData.mobile) return true;
  const ua = nav.userAgent;
  if (/Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua)) return true;
  // iPadOS reports itself as a Mac; touch points give it away.
  return /Macintosh/.test(ua) && nav.maxTouchPoints > 1;
}
