"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/** Compact 2px indicator (DESIGN-TOKENS §6); `tone="hot"` for Business Plan progress. */
function Progress({
  className,
  value,
  tone = "cool",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { tone?: "cool" | "hot" }) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn("relative h-0.5 w-full overflow-hidden bg-input", className)}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-transform duration-[240ms] ease-signature",
          tone === "hot" ? "bg-hot" : "bg-primary",
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
