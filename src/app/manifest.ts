import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.brand} — Premium veb həllər və SEO`,
    short_name: siteConfig.brand,
    description:
      "H2 Solutions — Next.js və Laravel ilə müasir korporativ saytlar, SEO və IT konsaltinq.",
    start_url: "/az",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0d1117",
    theme_color: "#0d1117",
    lang: "az",
    dir: "ltr",
    categories: ["business", "productivity", "developer"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
