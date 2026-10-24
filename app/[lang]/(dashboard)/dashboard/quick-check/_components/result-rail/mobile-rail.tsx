"use client"

import { ActivityIcon, ChevronDownIcon } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { useDictionary } from "../../../_components/i18n-provider"
import { useQuickCheck } from "../../../_components/use-quick-check"
import { VerdictBadge } from "../../../_components/verdict-badge"
import { RailSummary } from "./rail-summary"

/** Up to 1100px the live result collapses into a bar above the step: verdict at a glance, details on tap. */
export function MobileRail({ className }: { className?: string }) {
  const copy = useDictionary("quick-check")
  const { result } = useQuickCheck()
  return (
    <Collapsible data-slot="mobile-rail" className={cn("group/rail border bg-card", className)}>
      <CollapsibleTrigger className="flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 text-left">
        <ActivityIcon className="size-4 shrink-0 text-primary" strokeWidth={1.6} aria-hidden="true" />
        <span className="font-mono text-xs tracking-[0.075em] whitespace-nowrap text-primary uppercase max-sm:sr-only">{copy.ui.rail.toggle}</span>
        <span className="ml-auto flex min-w-0 items-center gap-2">
          {result?.status === "complete" ? (
            <VerdictBadge level={result.assessment.level} />
          ) : (
            result && <span className="truncate text-sm text-muted-foreground">{copy.ui.rail.incomplete.title}</span>
          )}
        </span>
        <ChevronDownIcon
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-[220ms] ease-signature group-data-[state=open]/rail:rotate-180"
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t px-4 pt-4 pb-5">
        <RailSummary />
      </CollapsibleContent>
    </Collapsible>
  )
}
