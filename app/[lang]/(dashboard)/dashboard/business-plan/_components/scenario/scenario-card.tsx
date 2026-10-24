"use client"

import { CheckIcon } from "lucide-react"
import { useId } from "react"

import { Button } from "@/components/ui/button"
import { presetFacts, presetFieldsOf, type PresetScenario } from "@/lib/business-plan"
import type { ScenarioId } from "@/lib/project"
import { cn } from "@/lib/utils"
import { useDictionary } from "../../../_components/i18n-provider"

/**
 * One scenario of the picker: its name, the facts it states (and so prefills, OQ-25) and the
 * button to use it. The custom use case states nothing.
 */
export function ScenarioCard({
  id,
  selected,
  onChoose,
}: {
  id: ScenarioId
  selected: boolean
  onChoose: () => void
}) {
  const bp = useDictionary("business-plan")
  const titleId = useId()
  const preset = id !== "custom"
  const fields = preset ? presetFieldsOf(bp.presets, id as PresetScenario) : []
  const facts = preset ? presetFacts(bp.presets, id as PresetScenario) : {}

  return (
    <article
      aria-labelledby={titleId}
      data-selected={selected || undefined}
      className={cn(
        "relative flex flex-col gap-4 border bg-background p-5 transition-colors duration-[180ms]",
        selected && "border-hot bg-card",
      )}
    >
      <header className="flex flex-col gap-2">
        {selected && (
          <span className="inline-flex items-center gap-1.5 font-mono text-xs tracking-[0.075em] text-hot uppercase">
            <CheckIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
            {bp.scenario.selected}
          </span>
        )}
        <h3 id={titleId} className="text-lg leading-snug font-[540] tracking-[-0.02em]">
          {bp.scenarios[id].label}
        </h3>
      </header>
      <div className="flex flex-1 flex-col gap-3">
        <p className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">{bp.scenario.prefills}</p>
        {fields.length === 0 ? (
          <p className="text-sm leading-snug text-text-secondary">{bp.scenario.prefillsNothing}</p>
        ) : (
          <dl className="flex flex-col gap-2 text-sm leading-snug">
            {fields.map((field) => {
              const value = facts[field]
              return (
                <div key={field} className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-x-3">
                  <dt className="text-muted-foreground">{bp.fields.site[field].label}</dt>
                  <dd>{Array.isArray(value) ? value.join(", ") : value}</dd>
                </div>
              )
            })}
          </dl>
        )}
      </div>
      <Button type="button" variant={selected ? "secondary" : "hot"} aria-pressed={selected} onClick={onChoose}>
        {preset ? bp.scenario.choose : bp.scenario.chooseCustom}
      </Button>
    </article>
  )
}
