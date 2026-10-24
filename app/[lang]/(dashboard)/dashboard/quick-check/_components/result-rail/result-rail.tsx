"use client"

import { ActivityIcon } from "lucide-react"
import { useId } from "react"
import { cn } from "@/lib/utils"
import { useDictionary } from "../../../_components/i18n-provider"
import { RailSummary } from "./rail-summary"

/** The live result beside the steps from 1101px (DESIGN-TOKENS §7); sticky under the top bar. */
export function ResultRail({ className }: { className?: string }) {
  const rail = useDictionary("quick-check").ui.rail
  const id = useId()
  return (
    <aside
      aria-labelledby={`${id}-title`}
      className={cn(
        "relative flex flex-col gap-4 border bg-card p-5 before:absolute before:inset-x-0 before:-top-px before:h-0.5 before:bg-primary",
        className,
      )}
    >
      <h2 id={`${id}-title`} className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.075em] text-primary uppercase">
        <ActivityIcon className="size-4" strokeWidth={1.6} aria-hidden="true" />
        {rail.title}
      </h2>
      <RailSummary />
    </aside>
  )
}
