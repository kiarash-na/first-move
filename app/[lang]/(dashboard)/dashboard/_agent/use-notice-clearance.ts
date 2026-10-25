"use client"

import { useEffect, useState, useSyncExternalStore } from "react"

import { noticeHidden, subscribeNotice } from "@/lib/legal/notice"

/** The launcher's place: 16px from the right and bottom edges, 48px square. */
export const LAUNCHER_GAP = 16
export const LAUNCHER_SIZE = 48

/**
 * The cookie notice (bottom left, `components/cookie-notice`) is the only `section` placed
 * directly in `<body>`; `use-notice-clearance.test.tsx` renders both and fails if that changes.
 */
export const NOTICE_SELECTOR = "body > section[aria-label]"

/**
 * How far the launcher must move up so the cookie notice never covers it, in px (0 when they do
 * not meet). On phones the notice spans the width; on wide screens they sit side by side. Read
 * from the DOM in effects only, never while rendering.
 */
export function useNoticeClearance(): number {
  const hidden = useSyncExternalStore(subscribeNotice, noticeHidden, () => true)
  const [lift, setLift] = useState(0)

  useEffect(() => {
    if (hidden) return
    const notice = document.querySelector<HTMLElement>(NOTICE_SELECTOR)
    if (!notice) return
    const measure = () => {
      const rect = notice.getBoundingClientRect()
      const launcherLeft = window.innerWidth - LAUNCHER_GAP - LAUNCHER_SIZE
      setLift(rect.right > launcherLeft - 8 ? Math.max(0, Math.round(window.innerHeight - rect.top)) : 0)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(notice)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
      setLift(0)
    }
  }, [hidden])

  return hidden ? 0 : lift
}
