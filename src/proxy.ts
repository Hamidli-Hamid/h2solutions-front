import { NextResponse, type NextRequest } from "next/server";
import { i18n, isLocale, localePath, type Locale } from "@/i18n-config";

/**
 * The visitor's explicit choice — the `NEXT_LOCALE` cookie the language
 * switcher writes — or the default language. `Accept-Language` is deliberately
 * not consulted: redirecting on it sent an English-language browser that
 * followed an Azerbaijani search result to a different page from the one that
 * was ranked, and made the canonical az URLs a redirect for every AI fetcher
 * that forwards its user's language.
 */
function pickLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  return cookie && isLocale(cookie) ? cookie : i18n.defaultLocale;
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

  /* No explicit choice of another language: serve the page at the URL
     requested, so the canonical URL is a 200 for every client. */
  if (locale === i18n.defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${i18n.defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = localePath(locale, pathname === "/" ? "" : pathname);

  /* This target depends on the visitor's cookie, so a shared cache must not
     hand one visitor's language to the next — nor pin a crawler (which never
     carries the cookie) to a redirect. Temporary (307) for the same reason:
     the URL has no single permanent destination. */
  const response = NextResponse.redirect(url);
  response.headers.set("Vary", "Cookie");
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
