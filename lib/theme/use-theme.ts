"use client"

import { useCallback, useSyncExternalStore } from "react"
import { DEFAULT_THEME, applyTheme, currentTheme, storeTheme, type Theme } from "./theme"

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
  return () => observer.disconnect()
}

/**
 * The active theme, read from `<html data-theme>` (never from storage during render).
 * The server snapshot is dark, so hydration always matches the static shell.
 */
export function useTheme(): [Theme, (theme: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, () => currentTheme(), () => DEFAULT_THEME)
  const setTheme = useCallback((next: Theme) => {
    applyTheme(next)
    storeTheme(next)
  }, [])
  return [theme, setTheme]
}
