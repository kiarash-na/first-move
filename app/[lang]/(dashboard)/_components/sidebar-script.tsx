"use client"

import { SIDEBAR_INIT_SCRIPT } from "@/lib/dashboard/sidebar-state"

/**
 * Pre-paint sidebar script for `<head>` in the dashboard root layout, next to `ThemeScript`: puts
 * `data-sidebar="collapsed"` on `<html>` before first paint when the rail was collapsed, so CSS
 * draws the right width at once and nothing moves at hydration (D-59).
 *
 * Same inline-script helper as `ThemeScript` (preventing-flash-before-hydration guide):
 * `text/javascript` in the server HTML, `text/plain` when React renders it in the browser.
 */
export function SidebarScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: SIDEBAR_INIT_SCRIPT }}
    />
  )
}
