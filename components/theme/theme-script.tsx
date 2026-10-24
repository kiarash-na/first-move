"use client"

import { THEME_INIT_SCRIPT } from "@/lib/theme/theme"

/**
 * Pre-paint theme script for `<head>` in the dashboard and docs root layouts
 * (preventing-flash-before-hydration guide). The landing never renders it: it is always dark.
 *
 * A Client Component so it can follow the guide's inline-script helper: `text/javascript` in the
 * server HTML (runs before paint), `text/plain` when React renders it in the browser (e.g. the
 * root layout re-rendering on a language switch), where scripts never run and React warns.
 */
export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  )
}
