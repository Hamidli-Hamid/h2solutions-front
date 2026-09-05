import { NextResponse, type NextRequest } from "next/server";
import { i18n, isLocale, localePath, type Locale } from "@/i18n-config";

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

/**
 * Azerbaijani is served from the bare path (`/about`), the other five from
 * their prefix (`/en/about`) — see `localePath`. The routes themselves all
 * live under `app/[lang]`, so a prefix-less URL is *rewritten* onto the
 * default locale's tree: the address bar keeps `/about` while `[lang]`
 * resolves to `az`.
 *
 * The permanent `/az/...` → `/...` redirect is not here but in
 * `next.config.ts`: Next re-normalises a middleware `Location` against the
 * incoming request, which behind the cPanel proxy stamps the origin's internal
 * port onto it. Config redirects are emitted verbatim.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [first, ...rest] = pathname.split("/").filter(Boolean);

  /* `/EN/about` matches no route, so without this it would fall through to the
     locale detector and be sent to `/en/EN/about` — a redirect whose target is
     a 404. Normalising the case lands it on the real page instead. */
  if (first && !isLocale(first) && isLocale(first.toLowerCase())) {
    const url = request.nextUrl.clone();
    const tail = rest.length > 0 ? `/${rest.join("/")}` : "";
    url.pathname = localePath(first.toLowerCase() as Locale, tail);
    return NextResponse.redirect(url, 308);
  }

  // A real prefix (`/en/about`): the route tree already matches it.
  if (first && isLocale(first)) return;

  const locale = pickLocale(request);

  /* The visitor reads the default language — or asked for nothing in
     particular. Serve the page at the URL they requested: no redirect, so the
     canonical URL stays a 200 for crawlers and for anyone following a link. */
  if (locale === i18n.defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${i18n.defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = localePath(locale, pathname === "/" ? "" : pathname);

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
