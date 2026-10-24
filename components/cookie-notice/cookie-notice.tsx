"use client"

import Link from "next/link"
import { useEffect, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import { withLocale } from "@/lib/i18n/locale-path"
import type { Locale } from "@/lib/i18n/locales"
import { acknowledgeNotice, loadNotice, noticeHidden, subscribeNotice, watchNoticeInOtherTabs } from "@/lib/legal/notice"
import { cn } from "@/lib/utils"

const LINK = "inline-flex min-h-11 items-center text-foreground underline decoration-1 underline-offset-4 hover:text-cool"

/**
 * The cookie notice, bottom left. Informational only: First Move sets no optional cookie, so
 * there is nothing to accept or reject (see the Cookie Policy). It stays hidden on the server and
 * until the stored choice has been read in an effect, so it never reads storage while rendering.
 * `className` offsets it where the layout needs room, e.g. past the dashboard sidebar.
 */
export function CookieNotice({
  lang,
  copy,
  className,
}: {
  lang: Locale
  copy: Dictionary<"legal">["cookieNotice"]
  className?: string
}) {
  const hidden = useSyncExternalStore(subscribeNotice, noticeHidden, () => true)

  useEffect(() => {
    loadNotice()
    return watchNoticeInOtherTabs()
  }, [])

  if (hidden) return null

  return (
    <section
      aria-label={copy.label}
      className={cn(
        "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-40 flex w-[min(26rem,calc(100vw-2rem))] flex-col gap-3 border bg-card p-4 text-sm leading-relaxed text-card-foreground shadow-panel print:hidden",
        className,
      )}
    >
      <p>{copy.text}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        <Link href={withLocale("/cookies", lang)} className={LINK}>
          {copy.cookies}
        </Link>
        <Link href={withLocale("/privacy", lang)} className={LINK}>
          {copy.privacy}
        </Link>
        <Button size="sm" variant="secondary" onClick={acknowledgeNotice} className="ml-auto">
          {copy.dismiss}
        </Button>
      </div>
    </section>
  )
}
