"use client"

import { DECK_BOOT_SCRIPT } from "@/lib/presentation/boot"

/**
 * Pre-paint script for the presentation's `<head>` (see `lib/presentation/boot.ts`). A Client
 * Component for the same reason as `ThemeScript`: `text/javascript` in the server HTML, so it runs
 * before paint, and `text/plain` when React renders it in the browser, where scripts never run.
 */
export function DeckBootScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: DECK_BOOT_SCRIPT }}
    />
  )
}
