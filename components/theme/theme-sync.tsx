"use client"

import { useLayoutEffect } from "react"
import { THEME_STORAGE_KEY, applyTheme, isTheme, readStoredTheme } from "@/lib/theme/theme"

/**
 * Re-applies the stored theme after hydration (React's dev remount resets `<html>`
 * attributes) and follows theme changes made in other tabs. Renders nothing.
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    const stored = readStoredTheme()
    if (stored) applyTheme(stored)

    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && isTheme(event.newValue)) applyTheme(event.newValue)
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  return null
}
