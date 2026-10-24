"use client"

import { ArrowRightIcon, BriefcaseBusinessIcon, GaugeIcon, WorkflowIcon, type LucideIcon } from "lucide-react"

import type { StartPath } from "@/lib/dashboard/start-paths"
import { cn } from "@/lib/utils"
import { useDictionary } from "../_components/i18n-provider"

const LOOK: Record<StartPath, { icon: LucideIcon; bar: string; hover: string; iconBox: string }> = {
  "quick-check": { icon: GaugeIcon, bar: "bg-primary", hover: "hover:border-primary/70", iconBox: "border-primary/50 text-primary" },
  "business-plan": { icon: BriefcaseBusinessIcon, bar: "bg-hot", hover: "hover:border-hot/70", iconBox: "border-hot/50 text-hot" },
  both: {
    icon: WorkflowIcon,
    bar: "bg-[linear-gradient(90deg,var(--accent-cool)_50%,var(--accent-hot)_50%)]",
    hover: "hover:border-foreground/45",
    iconBox: "border-foreground/40 text-foreground",
  },
}

/** One path tile (D-03): Quick Check (cyan), Business Plan (orange) or both. */
export function PathTile({ path, onSelect }: { path: StartPath; onSelect: (path: StartPath) => void }) {
  const start = useDictionary("start")
  const copy = start.paths[path]
  const look = LOOK[path]
  const Icon = look.icon

  return (
    <button
      type="button"
      data-path={path}
      onClick={() => onSelect(path)}
      className={cn(
        "group relative flex h-full cursor-pointer flex-col gap-6 border bg-card p-6 text-left transition-[translate,border-color] duration-[170ms] ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] sm:p-7",
        look.hover,
      )}
    >
      <span aria-hidden="true" className={cn("absolute inset-x-0 -top-px h-0.5", look.bar)} />
      <span className={cn("inline-flex size-12 items-center justify-center border", look.iconBox)}>
        <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <span className="flex flex-1 flex-col gap-2">
        <span className="text-[23px] leading-[1.1] font-[560] tracking-[-0.04em] [font-stretch:84%]">{copy.title}</span>
        <span className="text-sm leading-relaxed text-text-secondary">{copy.body}</span>
      </span>
      <span className="flex items-center justify-between gap-4 border-t pt-4 font-mono text-xs tracking-[0.06em] uppercase">
        <span className="text-muted-foreground">{copy.meta}</span>
        <span className="inline-flex items-center gap-2 text-foreground">
          {start.paths.action}
          <ArrowRightIcon className="size-4 transition-transform duration-[180ms] group-hover:translate-x-0.5" strokeWidth={1.6} aria-hidden="true" />
        </span>
      </span>
    </button>
  )
}
