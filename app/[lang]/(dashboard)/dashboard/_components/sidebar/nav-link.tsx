"use client"

import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import type { NavTone } from "@/lib/dashboard/nav"
import { isActivePath } from "@/lib/dashboard/routes"
import { cn } from "@/lib/utils"
import { useRail } from "./rail"
import { RailTooltip } from "./rail-tooltip"

const INDICATOR: Record<NavTone, string> = {
  neutral: "bg-foreground",
  cool: "bg-primary",
  hot: "bg-hot",
}

/** In the collapsed rail a module's icons keep its colour, also on hover (D-17, D-59). */
const RAIL_TONE: Record<NavTone, string> = {
  neutral: "",
  cool: "rail:text-primary rail:group-hover:text-primary",
  hot: "rail:text-hot rail:group-hover:text-hot",
}

/**
 * One sidebar entry: a step number or an icon, the label, and a 2px indicator in the module colour
 * when active. In the collapsed rail (D-59) it shows only the icon, keeps the label for screen
 * readers and names itself in a tooltip (`tooltip`, by default the label).
 */
export function NavLink({
  href,
  label,
  tooltip = label,
  tone = "neutral",
  step = null,
  icon: Icon,
  onNavigate,
}: {
  href: string
  label: string
  tooltip?: string
  tone?: NavTone
  step?: number | null
  icon?: LucideIcon
  onNavigate?: () => void
}) {
  const active = isActivePath(usePathname(), href)
  // A numbered step needs its icon only in the rail; the mobile sheet renders as before.
  const rail = useRail()
  const showIcon = Icon !== undefined && (step === null || rail !== null)

  return (
    <RailTooltip label={tooltip}>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        onClick={onNavigate}
        className={cn(
          "group relative flex min-h-11 items-center gap-3 pr-3 pl-4 text-[15px] leading-tight transition-colors duration-[180ms] rail:justify-center rail:pr-0 rail:pl-0",
          active ? "bg-accent text-foreground" : "text-text-secondary hover:bg-accent/50 hover:text-foreground",
        )}
      >
        <span
          aria-hidden="true"
          className={cn("absolute inset-y-0 left-0 w-0.5 transition-colors", active ? INDICATOR[tone] : "bg-transparent")}
        />
        {step !== null && (
          <span
            aria-hidden="true"
            className={cn(
              "w-5 shrink-0 font-mono text-xs tabular-nums rail:hidden",
              active && tone === "cool" && "text-primary",
              active && tone === "hot" && "text-hot",
              !active && "text-muted-foreground",
            )}
          >
            {String(step).padStart(2, "0")}
          </span>
        )}
        {showIcon && (
          <Icon
            className={cn(
              "size-[18px] shrink-0",
              step !== null && "hidden rail:block",
              active && tone === "cool" && "text-primary",
              active && tone === "hot" && "text-hot",
              !active && "text-muted-foreground group-hover:text-foreground",
              RAIL_TONE[tone],
            )}
            strokeWidth={1.6}
            aria-hidden="true"
          />
        )}
        <span className="min-w-0 truncate rail:sr-only">{label}</span>
      </Link>
    </RailTooltip>
  )
}
