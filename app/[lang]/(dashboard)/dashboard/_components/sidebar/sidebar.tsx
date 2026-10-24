"use client"

import { useLayoutEffect, useMemo } from "react"

import { applySidebar, readStoredSidebar } from "@/lib/dashboard/sidebar-state"
import { useSidebarCollapsed } from "@/lib/dashboard/use-sidebar-collapsed"
import { cn } from "@/lib/utils"
import { useDictionary } from "../i18n-provider"
import { RailContext, SIDEBAR_ID, type Rail } from "./rail"
import { SidebarContent } from "./sidebar-content"
import { SidebarToggle } from "./sidebar-toggle"

/**
 * The fixed left sidebar from 900px (D-07); below that the same content opens in a sheet. It
 * collapses into a 4rem icon rail (D-59). CSS draws both states from `<html data-sidebar>`, which
 * the pre-paint SidebarScript sets, so the first paint is right; React state is only for
 * `aria-expanded` and the rail's tooltips.
 */
export function Sidebar({ className }: { className?: string }) {
  const shell = useDictionary("shell")
  const [collapsed, setCollapsed] = useSidebarCollapsed()
  const rail = useMemo<Rail>(() => ({ id: SIDEBAR_ID, collapsed, setCollapsed }), [collapsed, setCollapsed])

  // React's dev remount resets <html> attributes; put a stored collapse back (a no-op in production).
  useLayoutEffect(() => {
    if (readStoredSidebar()) applySidebar(true)
  }, [])

  return (
    <div className={cn("w-(--sidebar-width) shrink-0 border-r bg-sidebar text-sidebar-foreground max-md:hidden", className)}>
      <aside id={SIDEBAR_ID} data-slot="sidebar" aria-label={shell.nav.sidebar} className="sticky top-0 h-dvh">
        <RailContext value={rail}>
          <SidebarContent footer={<SidebarToggle />} />
        </RailContext>
      </aside>
    </div>
  )
}
