import type { Locale } from "../locales"
import { EMPTY_VALUE, INTL_LOCALES } from "./intl-locale"

function toDate(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Formats an ISO date in the UI language: `24 Oct 2026` / `24.10.2026`.
 * Uses the runtime's time zone, so call it on the client (after mount) for local times.
 */
export function formatDate(
  iso: string | null | undefined,
  lang: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  const date = toDate(iso)
  return date ? new Intl.DateTimeFormat(INTL_LOCALES[lang], options).format(date) : EMPTY_VALUE
}

/** Date and time: `24 Oct 2026, 14:05` / `24.10.2026, 14:05`. */
export function formatDateTime(
  iso: string | null | undefined,
  lang: Locale,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return formatDate(iso, lang, { dateStyle: "medium", timeStyle: "short", ...options })
}
