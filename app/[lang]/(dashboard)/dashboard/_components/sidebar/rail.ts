"use client"

import { createContext, useContext } from "react"

/**
 * What the parts of the desktop sidebar know about its icon rail (D-59). The mobile sheet renders
 * the same parts without it, so they render there as before: no tooltips, no rail-only controls.
 */
export interface Rail {
  /** Id of the sidebar landmark, for `aria-controls`. */
  id: string
  /**
   * React's copy of `<html data-sidebar>`, for `aria-expanded` and tooltips only; CSS draws the rail.
   * It lags the attribute until hydration catches up, so a handler that flips the state reads the
   * attribute itself (`isSidebarCollapsed`).
   */
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

/** Id of the desktop sidebar landmark, which the rail's controls name in `aria-controls`. */
export const SIDEBAR_ID = "dashboard-sidebar"

export const RailContext = createContext<Rail | null>(null)

/** The desktop sidebar's rail, or null outside it (the mobile sheet). */
export function useRail(): Rail | null {
  return useContext(RailContext)
}
