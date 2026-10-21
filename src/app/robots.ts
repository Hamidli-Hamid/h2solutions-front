import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * Paths no crawler has a reason to fetch — each one a real route. `/_next/` is
 * deliberately absent: every stylesheet and script the page needs lives under
 * it, and Google renders mobile-first — blocked CSS leaves it grading an
 * unstyled page.
 *
 * The revalidation webhook (`/api/`) and Cloudflare's obfuscated-email links
 * (`/cdn-cgi/`, which resolve to 404s) are all that is closed off.
 */
const disallow = ["/api/", "/cdn-cgi/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      /* One group per crawler wins outright in the REP: a `Googlebot` group
         saying only `Allow: /` would have exempted Googlebot from every
         Disallow above, so no search engine is singled out here — the wildcard
         group is the whole policy for them. */
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      // AI-crawler policy of record (2026-09-24, WF-20260924-1930-h2solutions-seo-geo): allow every search, answer and training crawler; refuse only Bytespider.
      {
        userAgent: "Bytespider",
        disallow: "/",
      },
    ],
    /* `Host:` is gone with this revision: Yandex retired it in 2018 and no
       other engine ever read it. The www duplicate it was meant to resolve is
       now handled where it belongs, by a permanent redirect in
       `next.config.ts`. */
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
