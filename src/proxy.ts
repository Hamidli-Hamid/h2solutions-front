import { NextResponse, type NextRequest } from "next/server";
import { i18n, isLocale, type Locale } from "@/i18n-config";

function pickLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && isLocale(cookie)) return cookie;

  const header = request.headers.get("accept-language");
  if (header) {
    const candidates = header
      .split(",")
      .map((part) => {
        const [tag, qPart] = part.trim().split(";");
        const q = qPart && qPart.startsWith("q=") ? parseFloat(qPart.slice(2)) : 1;
        return { tag: tag.toLowerCase(), q: Number.isFinite(q) ? q : 1 };
      })
      .sort((a, b) => b.q - a.q);

    for (const { tag } of candidates) {
      const base = tag.split("-")[0];
      if (isLocale(base)) return base;
    }
  }

  return i18n.defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [first, ...rest] = pathname.split("/").filter(Boolean);

  /* `/AZ/about` matches no route, so without this it would fall through to the
     locale detector and be sent to `/az/AZ/about` — a redirect whose target is
     a 404. Normalising the case lands it on the real page instead. */
  if (first && !isLocale(first) && isLocale(first.toLowerCase())) {
    const url = request.nextUrl.clone();
    url.pathname = `/${[first.toLowerCase(), ...rest].join("/")}`;
    return NextResponse.redirect(url, 308);
  }

  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (pathnameHasLocale) return;

  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  /* This target is negotiated from the request, so a shared cache must not
     hand one visitor's language to the next — nor pin Googlebot to whichever
     locale was cached first. Temporary (307) for the same reason: the URL has
     no single permanent destination. */
  const response = NextResponse.redirect(url);
  response.headers.set("Vary", "Accept-Language, Cookie");
  return response;
}

export const config = {
  matcher: [
    /* The social image routes carry no file extension, so they need naming
       here or the locale redirect swallows them (/opengraph-image ->
       /az/opengraph-image -> 404). */
    "/((?!_next/static|_next/image|_next/data|api|favicon.ico|opengraph-image|twitter-image|robots.txt|sitemap.xml|llms.txt|.*\\..*).*)",
  ],
};
