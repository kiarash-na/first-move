"use client"

import { useCallback, useSyncExternalStore } from "react"
import { SIDEBAR_ATTRIBUTE, applySidebar, isSidebarCollapsed, storeSidebar } from "./sidebar-state"

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [SIDEBAR_ATTRIBUTE] })
  return () => observer.disconnect()
}

/**
 * Whether the desktop sidebar is collapsed, read from `<html data-sidebar>` (never from storage
 * during render), and a setter that applies and stores the choice (D-59). The server snapshot is
 * expanded, so hydration matches the static shell. CSS has already drawn the right state by then;
 * this value is only for what CSS cannot do: `aria-expanded` and whether the rail's tooltips show.
 */
export function useSidebarCollapsed(): [boolean, (collapsed: boolean) => void] {
  const collapsed = useSyncExternalStore(subscribe, () => isSidebarCollapsed(), () => false)
  const setCollapsed = useCallback((next: boolean) => {
    applySidebar(next)
    storeSidebar(next)
  }, [])
  return [collapsed, setCollapsed]
}
