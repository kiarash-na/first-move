"use client"

import { CheckIcon, ScanSearchIcon, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { ResultLevel } from "@/lib/quick-check"
import { cn } from "@/lib/utils"
import { useDictionary } from "./i18n-provider"

const STYLE: Record<ResultLevel, { icon: typeof CheckIcon; className: string }> = {
  promising: { icon: CheckIcon, className: "border-primary text-primary" },
  further_analysis: { icon: ScanSearchIcon, className: "border-foreground/60 text-foreground" },
  not_promising: { icon: XIcon, className: "border-hot text-hot" },
}

/**
 * The overall Quick Check result as a tag (DESIGN-TOKENS §2 state mapping): Promising = cyan +
 * check, Further analysis = Paper + analysis icon, Not promising = orange + cross. Never colour alone.
 */
export function VerdictBadge({ level, className }: { level: ResultLevel; className?: string }) {
  const copy = useDictionary("quick-check").results.levels[level]
  const { icon: Icon, className: tone } = STYLE[level]
  return (
    <Badge variant="outline" data-level={level} className={cn(tone, className)}>
      <Icon strokeWidth={1.8} aria-hidden="true" />
      {copy.label}
    </Badge>
  )
}
