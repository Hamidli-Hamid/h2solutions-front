import { connection } from "next/server";

import { collectSitemapEntries, renderSitemap } from "@/lib/sitemap";

/**
 * `/sitemap.xml` — a route handler rather than `app/sitemap.ts`, because the
 * metadata convention cannot write the `<?xml-stylesheet?>` line and could
 * only answer 200 with whatever its reads returned.
 *
 * Rendered per request on purpose. At this path Next still prerenders the
 * handler as ISR (the build listed it `○ 5m`), and an ISR route handler caches
 * whatever it returns — 503 included — so one failed revalidation would replace
 * the last good sitemap. `connection()` opts it out ("you want it to be
 * rendered at runtime and not prerendered at build time" —
 * docs/01-app/03-api-reference/04-functions/connection.md). The API reads
 * underneath keep their own five-minute data cache under the content tag, so a
 * request is string building over cached data, an admin save still refreshes
 * it at once, and a stale-but-complete read still answers during a blip.
 */
export async function GET() {
  await connection();

  try {
    const entries = await collectSitemapEntries();

    return new Response(renderSitemap(entries), {
      headers: {
        "Content-Type": "application/xml",
        // What the metadata route sent; unchanged.
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (err) {
    console.error("sitemap.xml: API read failed, answering 503:", err);

    /* A short sitemap would read as "these URLs are gone". A 503 with
       Retry-After tells crawlers to come back, and must not be cached. */
    return new Response("Sitemap temporarily unavailable.\n", {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Retry-After": "300",
        "Cache-Control": "no-store",
      },
    });
  }
}
