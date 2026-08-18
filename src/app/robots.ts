import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * Paths no crawler has a reason to fetch. `/_next/` is deliberately absent:
 * every stylesheet and script the page needs lives under it, and Google renders
 * mobile-first — blocked CSS leaves it grading an unstyled page.
 *
 * The revalidation webhook (`/api/`) and Cloudflare's obfuscated-email links
 * (`/cdn-cgi/`, which resolve to 404s) are all that is closed off.
 */
const disallow = ["/api/", "/cdn-cgi/", "/private/"];

/**
 * The crawlers behind AI answers and AI-assisted search. They are named
 * explicitly — and given exactly the access Googlebot has — because a site that
 * sells generative-engine optimisation has no business hiding from the engines
 * it optimises for.
 *
 * `Google-Extended` and `Applebot-Extended` are not crawlers at all: they are
 * usage opt-outs read by Gemini/AI Overviews and Apple Intelligence. Naming
 * them here is what keeps this site eligible to be cited there.
 */
const aiAgents = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "meta-externalagent",
];

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
      {
        userAgent: aiAgents,
        allow: "/",
        disallow,
      },
    ],
    /* `Host:` is gone with this revision: Yandex retired it in 2018 and no
       other engine ever read it. The www duplicate it was meant to resolve is
       now handled where it belongs, by a 308 in `src/proxy.ts`. */
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
