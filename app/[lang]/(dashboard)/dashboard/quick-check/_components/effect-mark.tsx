"use client"

import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react"
import type { DriverEffect } from "@/lib/quick-check"
import { cn } from "@/lib/utils"
import { useDictionary } from "../../_components/i18n-provider"

/**
 * Supporting (cyan, up arrow) or limiting (orange, down arrow) factor, or neutral (QCT-KF-05).
 * Icon plus accessible text: never colour alone (DESIGN-TOKENS §2).
 */
export function EffectMark({ effect, className }: { effect: DriverEffect | null; className?: string }) {
  const copy = useDictionary("quick-check").ui.results.drivers
  const Icon = effect === "supporting" ? ArrowUpRightIcon : effect === "limiting" ? ArrowDownRightIcon : MinusIcon
  return (
    <span
      data-effect={effect ?? "none"}
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center border",
        effect === "supporting" && "border-primary/60 text-primary",
        effect === "limiting" && "border-hot/60 text-hot",
        effect === null && "text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
      {effect && <span className="sr-only">{copy[effect]}</span>}
    </span>
  )
}
