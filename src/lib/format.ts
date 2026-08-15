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
