import type { NextConfig } from "next";

/**
 * The one hostname every canonical URL, hreflang annotation and sitemap entry
 * names. `www.` resolves and serves the whole site as well, which makes every
 * page reachable under two hostnames — a duplicate site as far as Google is
 * concerned, and twice the crawling for the same content.
 */
const canonicalOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://h2solutions.az");
  } catch {
    return new URL("https://h2solutions.az");
  }
})();

/**
 * Fold `www` into the apex, permanently.
 *
 * This belongs in the config rather than in `src/proxy.ts`: Next re-normalises
 * a `Location` set from middleware against the incoming request, which stamps
 * the origin's internal port onto it — behind the cPanel proxy Googlebot would
 * have been handed `https://h2solutions.az:3000/`. A config redirect is emitted
 * verbatim.
 *
 * Left out entirely when the site is served from localhost or a port, so a
 * development server never redirects itself into production.
 */
function canonicalHostRedirects() {
  const { host, hostname, origin } = canonicalOrigin;
  if (host !== hostname || hostname === "localhost" || hostname.startsWith("www.")) {
    return [];
  }

  return [
    {
      source: "/:path*",
      has: [{ type: "host" as const, value: `www.${hostname}` }],
      destination: `${origin}/:path*`,
      permanent: true,
    },
  ];
}

const nextConfig: NextConfig = {
  async redirects() {
    return canonicalHostRedirects();
  },
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // The root layout sits under `[lang]`, so a 404 for an unmatched URL has no
    // layout to render into — app/global-not-found.tsx supplies the document.
    globalNotFound: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16 blocks optimizing images that resolve to a private IP. In dev the
    // Laravel API is on localhost, so allow it there only — never in production.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "h2solutions.az",
      },
      {
        protocol: "https",
        hostname: "api.h2solutions.az",
      },
      // Uploads are served from the admin host (the backend's APP_URL), which
      // is where every `cover_image`/`gallery` URL in the API points.
      {
        protocol: "https",
        hostname: "admin.h2solutions.az",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8888",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8888",
      },
      {
        protocol: "http",
        hostname: "nginx",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          /* The site answers on http:// as well as https://, which is a second
             crawlable copy of every page. Browsers that have seen this header
             once stop issuing the http request at all; the redirect itself has
             to be configured at the edge (Cloudflare → SSL/TLS → Edge
             Certificates → Always Use HTTPS), since an origin behind a TLS
             terminator cannot tell the two apart reliably enough to redirect
             without risking a loop. `includeSubDomains` is left off: it would
             also bind every current and future subdomain. */
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
