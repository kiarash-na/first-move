"use client"

import { ArrowRightIcon, CalculatorIcon, ChevronDownIcon } from "lucide-react"
import Link from "next/link"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { docHref } from "@/lib/docs/pages"
import { useDictionary, useLocale } from "../../_components/i18n-provider"

/**
 * "How the AI Plan Score is made": the collapsed explanation next to the score (D-33), in the
 * same form as "How we calculate". Plain sentences, with a link to the full method in the docs.
 */
export function AiScoreHow() {
  const lang = useLocale()
  const copy = useDictionary("business-plan").aiScore.how

  return (
    <Collapsible className="group/how" data-slot="ai-score-how">
      <CollapsibleTrigger className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase transition-colors duration-[180ms] hover:text-foreground data-[state=open]:text-hot">
        <CalculatorIcon className="size-4" strokeWidth={1.6} aria-hidden="true" />
        {copy.title}
        <ChevronDownIcon
          className="size-4 transition-transform duration-[220ms] ease-signature group-data-[state=open]/how:rotate-180"
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden">
        <div className="mt-1 flex max-w-[70ch] flex-col gap-3 border-l-2 border-hot bg-muted/40 px-4 py-4 sm:px-5">
          <p className="text-sm leading-relaxed text-text-secondary">{copy.body}</p>
          <Link
            href={docHref(lang, "ai-plan-score")}
            className="group inline-flex min-h-11 w-fit items-center gap-2 font-mono text-xs tracking-[0.06em] text-hot uppercase"
          >
            {copy.docs}
            <ArrowRightIcon className="size-4 transition-transform duration-[180ms] group-hover:translate-x-0.5" strokeWidth={1.6} aria-hidden="true" />
          </Link>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
