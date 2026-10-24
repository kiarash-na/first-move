"use client"

import { Badge } from "@/components/ui/badge"
import type { ProjectModules } from "@/lib/project"
import { cn } from "@/lib/utils"
import { useDictionary } from "./i18n-provider"

/** The modules a project has on: Quick Check in cyan, Business Plan in orange (DESIGN-TOKENS §1). */
export function ModuleBadges({ modules, className }: { modules: ProjectModules; className?: string }) {
  const copy = useDictionary("shell").fields.meta.modules
  return (
    <span className={cn("flex flex-wrap gap-1.5", className)}>
      {modules.quickCheck && <Badge variant="default">{copy.quickCheck.label}</Badge>}
      {modules.businessPlan && <Badge variant="hot">{copy.businessPlan.label}</Badge>}
    </span>
  )
}
