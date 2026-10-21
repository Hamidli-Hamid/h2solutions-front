import { SITEMAP_XSL } from "@/lib/sitemap-xsl";

/* Prerendered once at build: "To cache a `GET` method, use a route config
   option such as `export const dynamic = 'force-static'`"
   (docs/01-app/01-getting-started/15-route-handlers.md). */
export const dynamic = "force-static";

/**
 * The stylesheet `/sitemap.xml` names in its `<?xml-stylesheet?>` line. Served
 * by a handler rather than from `public/` so the content type is explicit: a
 * browser shows raw XML when the stylesheet arrives as anything but an XML or
 * XSL type.
 */
export function GET() {
  return new Response(SITEMAP_XSL, {
    headers: {
      "Content-Type": "text/xsl; charset=utf-8",
      /* Revalidated like the sitemap itself; the static-route default is a
         one-year `s-maxage`, which would pin an old stylesheet at a CDN. */
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
