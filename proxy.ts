import { NextResponse, type NextRequest } from "next/server"
import { withLocale } from "@/lib/i18n/locale-path"
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/lib/i18n/locales"
import { pickLocale } from "@/lib/i18n/pick-locale"

/**
 * Redirects unprefixed paths to `/de/…`, or to `/en/…` when the language cookie says so
 * (D-67), and remembers the choice.
 */
export function proxy(request: NextRequest) {
  const locale = pickLocale(request.cookies.get(LOCALE_COOKIE)?.value)
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
  // Skips `_next`, `api` (route handlers), any path with a dot (files, `.well-known/workflow`),
  // and paths already starting with /en or /de.
  matcher: ["/((?!_next|api(?:/|$)|(?:en|de)(?:/|$)|.*\\..*).*)"],
}
