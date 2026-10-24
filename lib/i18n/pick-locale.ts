import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales"

/**
 * Redirect choice for unprefixed paths: the saved language (the `NEXT_LOCALE` cookie), else
 * German (D-67). The browser's `Accept-Language` is not read.
 */
export function pickLocale(cookie: string | null | undefined): Locale {
  return isLocale(cookie) ? cookie : DEFAULT_LOCALE
}
