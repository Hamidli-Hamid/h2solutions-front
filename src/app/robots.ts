import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /* `/_next/` must stay crawlable: every stylesheet and script the page
           needs lives under it, and Google renders mobile-first — blocked CSS
           leaves it grading an unstyled page. Only the webhook route and
           Cloudflare's obfuscated-email links (which resolve to 404s) are
           closed off. */
        disallow: ["/api/", "/cdn-cgi/", "/private/"],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
