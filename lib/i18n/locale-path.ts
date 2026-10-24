import { isLocale, type Locale } from "./locales"

/** The locale prefix of a pathname (`/de/dashboard` → `de`), or null. */
export function localeFromPath(pathname: string): Locale | null {
  const first = pathname.split("/")[1]
  return isLocale(first) ? first : null
}

/** Prefixes an unprefixed pathname: `/` → `/en`, `/dashboard` → `/en/dashboard`. */
export function withLocale(pathname: string, locale: Locale): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  return path === "/" ? `/${locale}` : `/${locale}${path}`
}

/** Same page in another locale: `/en/dashboard/overview` → `/de/dashboard/overview`. */
export function switchLocalePath(pathname: string, target: Locale): string {
  if (!localeFromPath(pathname)) return withLocale(pathname, target)
  const rest = pathname.split("/").slice(2).join("/")
  return rest ? `/${target}/${rest}` : `/${target}`
}
