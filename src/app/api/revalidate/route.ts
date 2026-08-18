import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { CONTENT_TAG } from "@/lib/api";

/** Generated files that also carry admin content (icons, names, URLs). */
const METADATA_ROUTES = [
  "/manifest.webmanifest",
  "/sitemap.xml",
  "/robots.txt",
  "/llms.txt",
  "/opengraph-image",
  "/twitter-image",
];

/**
 * Called by the admin after content is saved, so an edit shows up straight
 * away instead of waiting out the five-minute revalidation window.
 *
 * The shared secret lives in H2_REVALIDATE_SECRET on both sides; without it
 * configured the route stays closed.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { revalidated: false, reason: "REVALIDATE_SECRET is not configured" },
      { status: 503 },
    );
  }

  const provided =
    request.headers.get("x-revalidate-secret") ??
    request.nextUrl.searchParams.get("secret");

  if (provided !== secret) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }

  revalidateTag(CONTENT_TAG, "max");
  // Every page reads the content tree through the layout, so one sweep of it
  // covers all languages and routes.
  revalidatePath("/[lang]", "layout");

  // Metadata routes sit outside that layout and have to be named.
  for (const path of METADATA_ROUTES) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
