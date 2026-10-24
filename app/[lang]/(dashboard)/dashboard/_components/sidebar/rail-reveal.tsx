"use client"

import type { LucideIcon } from "lucide-react"
import type { RefObject } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useRail } from "./rail"
import { RailTooltip } from "./rail-tooltip"

/**
 * The icon that stands for a sidebar part the collapsed rail hides, such as the open project or
 * the privacy note (D-59). Its tooltip shows the part's text. Clicking expands the sidebar and
 * moves focus to the part (`target`, focusable with tabIndex -1), so focus never disappears with
 * the button. Shown only while collapsed (CSS); renders nothing outside the desktop sidebar.
 */
export function RailReveal({
  icon: Icon,
  label,
  tooltip,
  target,
  loading = false,
  iconClassName,
  className,
}: {
  icon: LucideIcon
  /** Accessible name of the button. */
  label: string
  tooltip: string
  target: RefObject<HTMLElement | null>
  /** A skeleton instead of the button, while the part is loading. */
  loading?: boolean
  iconClassName?: string
  className?: string
}) {
  const rail = useRail()
  if (!rail) return null

  return (
    <div data-slot="rail-reveal" className={cn("hidden shrink-0 justify-center rail:flex", className)}>
      {loading ? (
        <Skeleton className="size-11" />
      ) : (
        <RailTooltip label={tooltip}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            aria-expanded={!rail.collapsed}
            aria-controls={rail.id}
            onClick={() => {
              rail.setCollapsed(false)
              target.current?.focus()
            }}
          >
            <Icon className={cn("size-[18px]", iconClassName)} strokeWidth={1.6} aria-hidden="true" />
          </Button>
        </RailTooltip>
      )}
    </div>
  )
}
