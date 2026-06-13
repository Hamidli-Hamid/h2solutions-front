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

  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (pathnameHasLocale) return;

  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
