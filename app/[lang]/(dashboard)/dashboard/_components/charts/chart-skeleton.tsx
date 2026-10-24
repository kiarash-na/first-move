"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useDictionary } from "../i18n-provider"

/** The placeholder shown while a lazily loaded chart downloads. Same height, so nothing jumps. */
export function ChartSkeleton({ height = 240, className }: { height?: number; className?: string }) {
  const label = useDictionary("overview").charts.loading
  return (
    <div role="status" aria-busy="true" data-slot="chart-skeleton" className={cn("w-full", className)} style={{ height }}>
      <Skeleton className="size-full" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
