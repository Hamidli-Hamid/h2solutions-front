import type { MetadataRoute } from "next";

import { getDictionary } from "@/lib/dictionaries";
import { resolveBranding } from "@/lib/site-config";
import { i18n } from "@/i18n-config";

/** Sizes worth listing for installed apps and Android launchers. */
const PWA_SIZES = ["192", "256", "384", "512"];

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const dict = await getDictionary(i18n.defaultLocale);
  const branding = resolveBranding(dict);

  /* The generated PNG set when a favicon was uploaded; the bundled vector mark
     otherwise. */
  const uploaded = PWA_SIZES.filter((size) => branding.icons[size]).map((size) => ({
    src: branding.icons[size],
    sizes: `${size}x${size}`,
    type: "image/png",
    purpose: "any" as const,
  }));

  const icons: MetadataRoute.Manifest["icons"] =
    uploaded.length > 0
      ? [
          ...uploaded,
          {
            src: branding.icons["512"],
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ]
      : [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          /* Drawn with the 20% margin Android crops into its own shape; the
             plain 512 would lose its border to that mask. */
          {
            src: "/android-chrome-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
        ];

  return {
    name: branding.appName,
    short_name: branding.appShortName,
    description: dict.meta.defaultDescription,
    start_url: `/${i18n.defaultLocale}`,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: branding.backgroundColor,
    theme_color: branding.themeColor,
    lang: i18n.defaultLocale,
    dir: "ltr",
    categories: ["business", "productivity", "developer"],
    icons,
  };
}
