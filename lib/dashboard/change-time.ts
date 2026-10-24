import { formatDate, formatDateTime } from "@/lib/i18n/format"
import type { Locale } from "@/lib/i18n/locales"

/**
 * A save or change time for the shell: the time alone when it is today (`14:05`), else date and
 * time. Uses the runtime's time zone, so call it on the client after mount.
 */
export function formatChangeTime(iso: string | null | undefined, lang: Locale, now: Date = new Date()): string {
  if (!iso) return formatDate(iso, lang)
  const date = new Date(iso)
  const today = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
  return today ? formatDate(iso, lang, { timeStyle: "short" }) : formatDateTime(iso, lang)
}
