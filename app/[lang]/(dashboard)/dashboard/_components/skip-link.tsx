"use client"

import { useDictionary } from "./i18n-provider"

/**
 * The first tab stop of every dashboard page: jumps over the sidebar and top bar to the main
 * content (WCAG 2.4.1). Visible only while it has focus.
 */
export function SkipLink() {
  const shell = useDictionary("shell")
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:border focus:border-primary focus:bg-card focus:px-4 focus:py-3 focus:text-sm focus:text-foreground"
    >
      {shell.skipToContent}
    </a>
  )
}
