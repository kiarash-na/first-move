"use client"

import type { ReactElement, SyntheticEvent } from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useRail } from "./rail"

/**
 * Names a sidebar control to the right of it, on hover and on keyboard focus, while the desktop
 * sidebar is collapsed into its icon rail (D-59); `always` keeps it for a control that is an icon
 * in both states. Outside the desktop sidebar (the mobile sheet) the child renders as it is.
 * The child must be an element that takes a ref and DOM props (a link or a button).
 */
export function RailTooltip({ label, always = false, children }: { label: string; always?: boolean; children: ReactElement }) {
  const rail = useRail()
  if (!rail) return children

  // Radix keeps its own open state, in step with the pointer and focus. While the labels show,
  // the events that would open the tooltip are marked handled, so Radix skips them.
  const active = always || rail.collapsed
  const hold = (event: SyntheticEvent) => {
    if (!active) event.preventDefault()
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild onPointerMove={hold} onFocus={hold}>
        {children}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}
