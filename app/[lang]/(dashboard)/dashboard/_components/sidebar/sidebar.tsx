"use client"

import { cn } from "@/lib/utils"
import { SidebarContent } from "./sidebar-content"

/** The fixed left sidebar from 900px (D-07); below that the same content opens in a sheet. */
export function Sidebar({ className }: { className?: string }) {
  return (
    <div className={cn("w-72 shrink-0 border-r bg-sidebar text-sidebar-foreground max-md:hidden", className)}>
      <aside data-slot="sidebar" className="sticky top-0 h-dvh">
        <SidebarContent />
      </aside>
    </div>
  )
}
