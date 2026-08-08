import { NextResponse, type NextRequest } from "next/server";

import { getDictionary } from "@/lib/dictionaries";
import { resolveBranding } from "@/lib/site-config";
import { i18n } from "@/i18n-config";

/**
 * Browsers and crawlers request /favicon.ico directly, without reading the
 * page, so this path has to answer with the current brand rather than whatever
 * icon happened to ship with the build. It points at the .ico generated from
 * the admin upload, and falls back to the bundled mark.
 */
export async function GET(request: NextRequest) {
  const dict = await getDictionary(i18n.defaultLocale);
  const { icons } = resolveBranding(dict);

  const target = icons.ico ?? "/favicon-default.ico";

  // Temporary: the target changes the moment a new favicon is uploaded.
  return NextResponse.redirect(new URL(target, request.url), 302);
}
