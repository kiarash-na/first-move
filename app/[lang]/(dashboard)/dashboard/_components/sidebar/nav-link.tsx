"use client"

import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import type { NavTone } from "@/lib/dashboard/nav"
import { isActivePath } from "@/lib/dashboard/routes"
import { cn } from "@/lib/utils"

const INDICATOR: Record<NavTone, string> = {
  neutral: "bg-foreground",
  cool: "bg-primary",
  hot: "bg-hot",
}

/** One sidebar entry: a step number or an icon, the label, and a 2px indicator in the module colour when active. */
export function NavLink({
  href,
  label,
  tone = "neutral",
  step = null,
  icon: Icon,
  onNavigate,
}: {
  href: string
  label: string
  tone?: NavTone
  step?: number | null
  icon?: LucideIcon
  onNavigate?: () => void
}) {
  const active = isActivePath(usePathname(), href)

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "group relative flex min-h-11 items-center gap-3 pr-3 pl-4 text-[15px] leading-tight transition-colors duration-[180ms]",
        active ? "bg-accent text-foreground" : "text-text-secondary hover:bg-accent/50 hover:text-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 w-0.5 transition-colors", active ? INDICATOR[tone] : "bg-transparent")}
      />
      {step !== null ? (
        <span
          aria-hidden="true"
          className={cn(
            "w-5 shrink-0 font-mono text-xs tabular-nums",
            active && tone === "cool" && "text-primary",
            active && tone === "hot" && "text-hot",
            !active && "text-muted-foreground",
          )}
        >
          {String(step).padStart(2, "0")}
        </span>
      ) : (
        Icon && (
          <Icon
            className={cn(
              "size-[18px] shrink-0",
              active && tone === "cool" && "text-primary",
              active && tone === "hot" && "text-hot",
              !active && "text-muted-foreground group-hover:text-foreground",
            )}
            strokeWidth={1.6}
            aria-hidden="true"
          />
        )
      )}
      <span className="min-w-0 truncate">{label}</span>
    </Link>
  )
}
