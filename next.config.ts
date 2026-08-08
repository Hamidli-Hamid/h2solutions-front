import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
