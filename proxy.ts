import { NextResponse, type NextRequest } from "next/server"
import { withLocale } from "@/lib/i18n/locale-path"
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/lib/i18n/locales"
import { pickLocale } from "@/lib/i18n/negotiate-locale"

/**
 * Redirects unprefixed paths to `/en/…` or `/de/…`: cookie first, then
 * `Accept-Language`, else EN (PLAN-DASH-00), and remembers the choice.
 */
export function proxy(request: NextRequest) {
  const locale = pickLocale({
    cookie: request.cookies.get(LOCALE_COOKIE)?.value,
    acceptLanguage: request.headers.get("accept-language"),
  })
  const url = request.nextUrl.clone()
  url.pathname = withLocale(url.pathname, locale)
  const response = NextResponse.redirect(url)
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  })
  return response
}

export const config = {
  // Skips `_next`, any path with a file extension, and paths already starting with /en or /de.
  matcher: ["/((?!_next|(?:en|de)(?:/|$)|.*\\..*).*)"],
}
