import { localeTags, type Locale } from "@/i18n-config";

/**
 * Formats an API timestamp for display. Returns "" for missing or invalid
 * values so callers can simply skip rendering the element.
 * UTC is pinned so the server and the client never disagree on the day.
 */
export function formatDate(value: string | null | undefined, lang: Locale): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(localeTags[lang], {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * The bare host of a project URL — "https://www.example.az/" reads as
 * "example.az". Returns "" when the value is not a usable URL.
 */
export function hostname(value: string | null | undefined): string {
  if (!value) return "";
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * A phone number only when it is one. The shipped dictionaries carry
 * "+994 50 000 00 00" as a placeholder until a real line is entered in the
 * admin, and a number whose subscriber part is all zeros is not a number — it
 * is a gap. Rendering it on the page is harmless; publishing it as
 * machine-readable contact data (schema.org `telephone`, /llms.txt) feeds a
 * fabricated detail into knowledge panels and AI answers, so those callers ask
 * here first and simply omit the field when this returns "".
 */
export function realPhone(value: string | null | undefined): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7) return "";
  // Everything past the country and operator prefix being zero is the tell.
  return /^0+$/.test(digits.slice(5)) ? "" : value;
}

/** `tel:` keeps the leading `+`; everything else but digits is dropped. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/**
 * `wa.me` takes the international number as bare digits — no `+`, no `00`
 * international prefix, no spacing.
 */
export function whatsappHref(number: string): string {
  return `https://wa.me/${number.replace(/\D/g, "").replace(/^00/, "")}`;
}

/**
 * The two direct lines, each only when it is a real number (see `realPhone`).
 * WhatsApp is its own admin field; a site without one uses the phone line,
 * which is the number the chat would reach anyway.
 */
export function contactNumbers(contact: { phone?: string | null; whatsapp?: string | null }): {
  phone: string;
  whatsapp: string;
} {
  const phone = realPhone(contact.phone);
  return { phone, whatsapp: realPhone(contact.whatsapp) || phone };
}

const SENTENCE_TERMINATORS = new Set([".", "!", "?", "…"]);
const SENTENCE_CLOSERS = new Set(['"', "'", "”", "’", "»", ")", "]"]);

/**
 * How far into the text a sentence end is looked for. The text is
 * editor-written (up to 20 000 characters) and this runs on every layout
 * render and every /llms.txt request, so the work per call is bounded as well
 * as linear.
 */
const SENTENCE_SCAN_LIMIT = 2000;

/**
 * The first sentence of a paragraph: text up to the first run of `.`, `!`, `?`
 * or `…` (plus any closing quotes or brackets right after it) that is followed
 * by whitespace or the end. "Next.js" does not end a sentence; a paragraph
 * with no terminal punctuation is returned whole. "" for empty input.
 *
 * A single forward scan. The earlier regex (`^.*?[.!?…]+…(?=\s|$)`)
 * backtracked quadratically over a long run of punctuation, so text typed in
 * the admin could stall the server (SEC-0032).
 *
 * A first sentence that does not end within the first SENTENCE_SCAN_LIMIT
 * characters is not a usable one-line definition: "" is returned and the
 * caller falls back to its own default. Text of at most that length with no
 * terminator is still returned whole.
 */
export function firstSentence(text: string | null | undefined): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return "";

  const limit = Math.min(clean.length, SENTENCE_SCAN_LIMIT);
  let i = 0;
  while (i < limit) {
    if (!SENTENCE_TERMINATORS.has(clean[i])) {
      i += 1;
      continue;
    }
    let end = i;
    while (end < clean.length && SENTENCE_TERMINATORS.has(clean[end])) end += 1;
    while (end < clean.length && SENTENCE_CLOSERS.has(clean[end])) end += 1;
    if (end === clean.length || clean[end] === " ") return clean.slice(0, end);
    // Nothing inside this run can end a sentence either; resume after it.
    i = end;
  }

  return clean.length <= SENTENCE_SCAN_LIMIT ? clean : "";
}

/**
 * The English name of an ISO 3166 country code ("AZ" → "Azerbaijan"), for
 * structured data. "" when the code is not one Intl knows.
 */
export function countryName(code: string | null | undefined): string {
  if (!code) return "";
  try {
    const name = new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase());
    return name && name !== code.toUpperCase() ? name : "";
  } catch {
    return "";
  }
}
