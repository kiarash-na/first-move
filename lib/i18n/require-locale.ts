import { notFound } from "next/navigation"
import { isLocale, type Locale } from "./locales"

/** Server guard for route params: returns the locale or renders the 404 page. */
export function requireLocale(value: string): Locale {
  if (!isLocale(value)) notFound()
  return value
}
