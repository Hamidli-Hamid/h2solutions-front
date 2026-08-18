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
