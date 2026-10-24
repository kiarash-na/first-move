"use client"

import { BookOpenIcon, ChevronDownIcon, CompassIcon, HelpCircleIcon, LightbulbIcon, type LucideIcon } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { promptsFor, type PromptKind } from "@/lib/business-plan"
import type { BusinessPlanStep } from "@/lib/project"
import { useDictionary } from "../../_components/i18n-provider"

const ICONS: Record<PromptKind, LucideIcon> = {
  question: HelpCircleIcon,
  learning: BookOpenIcon,
  tip: LightbulbIcon,
}

/**
 * The guiding prompts of a step (PLAN-DASH-10 step 3): key questions from the brief, learnings
 * and tips from the project. Open by default, can be folded away.
 */
export function GuidingPrompts({ step }: { step: BusinessPlanStep }) {
  const bp = useDictionary("business-plan")
  const prompts = promptsFor(step)

  return (
    <Collapsible defaultOpen className="group/prompts border bg-card" data-slot="guiding-prompts">
      <CollapsibleTrigger className="flex min-h-14 w-full cursor-pointer items-center gap-3 px-5 text-left transition-colors duration-[180ms] hover:bg-accent/40 sm:px-6">
        <CompassIcon className="size-5 shrink-0 text-hot" strokeWidth={1.5} aria-hidden="true" />
        <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3">
          <span className="font-mono text-xs tracking-[0.075em] text-hot uppercase">{bp.prompts.heading}</span>
          <span className="hidden text-sm text-muted-foreground sm:inline">{bp.prompts.lead}</span>
        </span>
        <ChevronDownIcon
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-[220ms] ease-signature group-data-[state=open]/prompts:rotate-180"
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden">
        <ul className="grid overflow-hidden border-t md:grid-cols-2 xl:grid-cols-3">
          {prompts.map((prompt) => {
            const Icon = ICONS[prompt.kind]
            return (
              <li
                key={prompt.id}
                className="flex flex-col gap-2.5 p-5 max-md:nth-[n+4]:hidden shadow-[1px_0_0_0_var(--border),0_1px_0_0_var(--border)]"
              >
                <span className="flex items-center gap-2 font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">
                  <Icon className="size-4 text-hot" strokeWidth={1.6} aria-hidden="true" />
                  {bp.prompts.kind[prompt.kind]}
                  <span aria-hidden="true">·</span>
                  <span>{prompt.source}</span>
                </span>
                <p className="text-[15px] leading-relaxed">{(bp.prompts as Record<string, unknown>)[prompt.id] as string}</p>
              </li>
            )
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}
