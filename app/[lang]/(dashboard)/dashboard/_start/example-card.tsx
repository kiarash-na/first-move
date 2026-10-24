"use client"

import { ArrowRightIcon, FlaskConicalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ExampleCard as ExampleCardData } from "@/lib/dashboard/example-cards"
import { formatHectares, formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary, useLocale } from "../_components/i18n-provider"
import { VerdictBadge } from "../_components/verdict-badge"

/**
 * One example (D-04, OQ-23): scenario, name, summary, key facts, the Quick Check verdict of its
 * inputs and the "Illustrative inputs only" label (DESIGN-TOKENS §6). Opening creates a copy.
 */
export function ExampleCard({ example, busy, onOpen }: { example: ExampleCardData; busy: boolean; onOpen: (id: string) => void }) {
  const lang = useLocale()
  const start = useDictionary("start")
  const scenarios = useDictionary("business-plan").scenarios
  const copy = start.examples
  const shell = useDictionary("shell")
  const scenario = example.scenarioId === "custom" ? copy.extra : scenarios[example.scenarioId].label

  return (
    <article aria-labelledby={`example-${example.id}`} data-example={example.id} className="flex flex-col border bg-card">
      <div className="flex flex-1 flex-col gap-3 px-5 pt-5 pb-4">
        <p className="font-mono text-xs leading-normal tracking-[0.06em] text-muted-foreground uppercase">{scenario}</p>
        <h3 id={`example-${example.id}`} className="text-xl leading-[1.15] font-[560] tracking-[-0.035em] [font-stretch:86%]">
          {example.name}
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">{example.summary}</p>
        <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">
          <span>{interpolate(copy.facts, { buildings: formatNumber(example.buildings, lang), area: formatHectares(example.areaM2, lang) })}</span>
          <span className="inline-flex items-center gap-1.5">
            <FlaskConicalIcon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
            {shell.illustrative}
          </span>
        </p>
      </div>
      <div className="flex flex-col gap-1.5 border-t px-5 py-4">
        <span className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">
          {copy.verdict}
          {example.forced && ` · ${copy.forced}`}
        </span>
        {example.level && <VerdictBadge level={example.level} />}
      </div>
      <Button
        variant="ghost"
        disabled={busy}
        onClick={() => onOpen(example.id)}
        aria-describedby={`example-${example.id}`}
        className="h-12 justify-between border-t px-5 hover:bg-accent/60 hover:text-primary"
      >
        {copy.open}
        <ArrowRightIcon strokeWidth={1.6} aria-hidden="true" />
      </Button>
    </article>
  )
}
