"use client"

import { FlaskConicalIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useDictionary } from "./i18n-provider"
import { useStoreState } from "./store-provider"

/**
 * "Illustrative inputs only" (OQ-23, DESIGN-TOKENS §6): shown wherever an opened example's numbers
 * or text appear (overview, Quick Check result, Business Plan steps). Nothing for own projects.
 */
export function IllustrativeBadge({ className }: { className?: string }) {
  const label = useDictionary("shell").illustrative
  const isExample = useStoreState((state) => Boolean(state.active?.meta.exampleId))
  if (!isExample) return null
  return (
    <Badge variant="outline" data-slot="illustrative" className={cn("text-foreground", className)}>
      <FlaskConicalIcon strokeWidth={1.6} aria-hidden="true" />
      {label}
    </Badge>
  )
}
