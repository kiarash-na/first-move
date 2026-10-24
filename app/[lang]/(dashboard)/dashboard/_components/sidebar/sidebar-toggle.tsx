"use client"

import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { isSidebarCollapsed } from "@/lib/dashboard/sidebar-state"
import { useDictionary } from "../i18n-provider"
import { useRail } from "./rail"
import { RailTooltip } from "./rail-tooltip"

/**
 * Collapses the desktop sidebar into its icon rail and back (D-59): a 44px button in the footer
 * row above the privacy note, at the same spot in both states. CSS picks the icon from
 * `<html data-sidebar>`; the label and `aria-expanded` follow React state. A click flips the
 * attribute itself: until hydration catches up, React still holds the server snapshot
 * (expanded) while CSS already draws the rail. No keyboard shortcut.
 */
export function SidebarToggle() {
  const shell = useDictionary("shell")
  const rail = useRail()
  if (!rail) return null

  const label = rail.collapsed ? shell.nav.rail.expand : shell.nav.rail.collapse
  return (
    <div data-slot="sidebar-toggle" className="flex shrink-0 items-center border-t px-2.5 py-2">
      <RailTooltip always label={label}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          aria-expanded={!rail.collapsed}
          aria-controls={rail.id}
          onClick={() => rail.setCollapsed(!isSidebarCollapsed())}
        >
          <PanelLeftCloseIcon className="size-[18px] rail:hidden" strokeWidth={1.6} aria-hidden="true" />
          <PanelLeftOpenIcon className="hidden size-[18px] rail:block" strokeWidth={1.6} aria-hidden="true" />
        </Button>
      </RailTooltip>
    </div>
  )
}
