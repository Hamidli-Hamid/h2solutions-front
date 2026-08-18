import { getDictionary } from "@/lib/dictionaries";
import { resolveBranding } from "@/lib/site-config";
import { i18n } from "@/i18n-config";

/**
 * Browsers and crawlers request /favicon.ico directly, without reading the
 * page, so this path has to answer with the current brand rather than whatever
 * icon happened to ship with the build. It points at the .ico generated from
 * the admin upload, and falls back to the bundled mark.
 *
 * The `Location` is written by hand rather than through `NextResponse.redirect`,
 * which resolves relative targets against `request.url` — behind the cPanel
 * proxy that is the origin's own `http://localhost:3000`, so every visitor and
 * every crawler was being sent to a host that does not exist publicly. A
 * relative `Location` is valid per RFC 9110 §10.2.2 and resolves against
 * whatever hostname the request actually arrived on.
 */
export async function GET() {
  const dict = await getDictionary(i18n.defaultLocale);
  const { icons } = resolveBranding(dict);

  const target = icons.ico ?? "/favicon-default.ico";

  return new Response(null, {
    // Temporary: the target changes the moment a new favicon is uploaded.
    status: 302,
    headers: {
      Location: target,
      /* Google refetches the favicon on its own schedule; a day of caching
         keeps the hop off the critical path without pinning a replaced icon. */
      "Cache-Control": "public, max-age=86400",
    },
  });
}
