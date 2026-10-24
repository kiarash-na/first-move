"use client"

import { ScanSearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDictionary } from "../../../_components/i18n-provider"

/** "Screening, not a full feasibility study" (QCT-SCOPE-07/08, DESIGN-TOKENS §1, §6). */
export function ScreeningNote({ className }: { className?: string }) {
  const ui = useDictionary("quick-check").ui.results.screening
  return (
    <aside data-slot="screening-note" className={cn("flex items-start gap-3 border-l-2 border-foreground/40 py-1 pl-4", className)}>
      <ScanSearchIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-[0.075em] text-foreground uppercase">{ui.title}</p>
        <p className="max-w-[72ch] text-sm leading-relaxed text-text-secondary">{ui.body}</p>
      </div>
    </aside>
  )
}
