"use client"

import { CalculatorIcon, ChevronDownIcon } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useDictionary } from "../../../_components/i18n-provider"

/**
 * "How completeness is counted": the quiet, collapsed explanation (D-33) in the same form as
 * "How we calculate". The Business Plan has no equation (D-27), so it is a plain sentence only.
 */
export function ReadinessHow() {
  const bp = useDictionary("business-plan")

  return (
    <Collapsible className="group/how" data-slot="readiness-how">
      <CollapsibleTrigger className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase transition-colors duration-[180ms] hover:text-foreground data-[state=open]:text-hot">
        <CalculatorIcon className="size-4" strokeWidth={1.6} aria-hidden="true" />
        {bp.readiness.how.title}
        <ChevronDownIcon
          className="size-4 transition-transform duration-[220ms] ease-signature group-data-[state=open]/how:rotate-180"
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden">
        <p className="mt-1 max-w-[70ch] border-l-2 border-hot bg-muted/40 px-4 py-4 text-sm leading-relaxed text-text-secondary sm:px-5">
          {bp.readiness.how.body}
        </p>
      </CollapsibleContent>
    </Collapsible>
  )
}
