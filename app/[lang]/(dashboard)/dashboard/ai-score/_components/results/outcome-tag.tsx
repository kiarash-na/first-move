"use client"

import { CheckIcon, MinusIcon, ScanSearchIcon, XIcon } from "lucide-react"

import type { AiGateOutcome } from "@/lib/project"
import { cn } from "@/lib/utils"
import { useDictionary } from "../../../_components/i18n-provider"

/** DESIGN-TOKENS §2 state mapping: pass = cyan + check, fail = orange + cross, unclear = Paper + analysis icon. */
const STYLE: Record<AiGateOutcome, { icon: typeof CheckIcon; className: string }> = {
  pass: { icon: CheckIcon, className: "border-primary text-primary" },
  unclear: { icon: ScanSearchIcon, className: "border-foreground/60 text-foreground" },
  fail: { icon: XIcon, className: "border-hot text-hot" },
  skipped: { icon: MinusIcon, className: "border-border text-muted-foreground" },
}

/** The outcome of a check as a tag with icon and word, never colour alone. */
export function OutcomeTag({ outcome, className }: { outcome: AiGateOutcome; className?: string }) {
  const label = useDictionary("ai-score").labels.outcomes[outcome]
  const { icon: Icon, className: tone } = STYLE[outcome]
  return (
    <span
      data-slot="outcome-tag"
      data-outcome={outcome}
      className={cn("inline-flex w-fit items-center gap-1.5 border px-2 py-0.5 font-mono text-xs tracking-[0.06em] uppercase", tone, className)}
    >
      <Icon className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
      {label}
    </span>
  )
}
