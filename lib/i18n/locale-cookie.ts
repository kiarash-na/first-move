import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Locale } from "./locales"

/** Cookie string that remembers the language for `proxy.ts` (path `/`, 1 year). */
export function localeCookie(locale: Locale): string {
  return `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`
}

/** Client only: call from an event handler, never during render. */
export function writeLocaleCookie(locale: Locale): void {
  document.cookie = localeCookie(locale)
}
