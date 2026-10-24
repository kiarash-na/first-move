"use client"

import { HelpCircleIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatEnergy, formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { getAt, parsePath, type ChoiceField, type SourceKey } from "@/lib/project"
import type { CapacityRow } from "@/lib/quick-check"
import { cn } from "@/lib/utils"
import { useFieldPatch } from "../../../../_components/fields/use-field-patch"
import { useDictionary, useLocale, useTextRef } from "../../../../_components/i18n-provider"
import { useStoreState } from "../../../../_components/store-provider"

type Level = "low" | "medium" | "high"
const isLevel = (value: string | null): value is Level => value === "low" || value === "medium" || value === "high"

/**
 * One energy source (QCT-IN-06/07): choosing a potential selects it, the default capacity and
 * COP of that level are shown (TBL-4/5, with overrides), Unknown explains its effect (KF-06).
 */
export function SourceCard({ field, heating, cooling }: { field: ChoiceField; heating: CapacityRow; cooling: CapacityRow }) {
  const lang = useLocale()
  const text = useTextRef()
  const copy = useDictionary("quick-check")
  const ui = copy.ui.sources
  const patch = useFieldPatch()
  const value = useStoreState((state) => {
    const stored = state.active ? getAt(state.active, parsePath(field.id) ?? []) : null
    return typeof stored === "string" ? stored : null
  })
  const name = text(field.text) ?? field.id
  const source = field.row as SourceKey
  const select = (next: string | null) => patch({ [field.id]: next || null })

  return (
    <article
      data-slot="source-card"
      data-source={source}
      data-potential={value ?? "none"}
      className={cn(
        "relative flex flex-col gap-4 border bg-card p-5 transition-colors duration-[180ms]",
        "before:absolute before:inset-x-0 before:-top-px before:h-0.5",
        value === "unknown" ? "before:bg-foreground/50" : value ? "border-primary/40 before:bg-primary" : "before:bg-transparent",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 id={`${field.id}-name`} className="text-lg leading-tight font-[560] tracking-[-0.03em] [font-stretch:86%]">
            {name}
          </h3>
          <span className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">
            {value ? copy.potentials[value as keyof typeof copy.potentials].label : ui.notSelected}
          </span>
        </div>
        {value && (
          <Button variant="ghost" size="icon" className="-m-2.5" aria-label={interpolate(ui.remove, { source: name })} onClick={() => select(null)}>
            <XIcon strokeWidth={1.6} aria-hidden="true" />
          </Button>
        )}
      </header>
      <ToggleGroup
        type="single"
        variant="outline"
        value={value ?? ""}
        onValueChange={select}
        aria-label={interpolate(ui.potential, { source: name })}
        className="grid w-full grid-cols-4"
      >
        {field.options.map((option) => (
          <ToggleGroupItem key={option} value={option} className="w-full px-1.5" data-option={option}>
            {text(field.optionText, `${option}.label`) ?? option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="min-h-[4.5rem] text-sm leading-snug">
        {isLevel(value) ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            <dt className="font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">{ui.heating}</dt>
            <dd className="font-mono tabular-nums">
              {formatEnergy(heating[value], lang, { perYear: true })}
              <span className="ml-2 text-muted-foreground">
                {heating.cop === null ? ui.noHeatPump : `${ui.cop} ${formatNumber(heating.cop, lang, { maximumFractionDigits: 2 })}`}
              </span>
            </dd>
            <dt className="font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">{ui.cooling}</dt>
            <dd className="font-mono tabular-nums">
              {cooling[value] === null ? (
                <span className="text-muted-foreground">{ui.noCooling}</span>
              ) : (
                <>
                  {formatEnergy(cooling[value], lang, { perYear: true })}
                  {cooling.cop !== null && (
                    <span className="ml-2 text-muted-foreground">{`${ui.cop} ${formatNumber(cooling.cop, lang, { maximumFractionDigits: 2 })}`}</span>
                  )}
                </>
              )}
            </dd>
          </dl>
        ) : value === "unknown" ? (
          <p className="flex items-start gap-2 text-text-secondary">
            <HelpCircleIcon className="mt-0.5 size-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
            {ui.unknown}
          </p>
        ) : (
          <p className="text-muted-foreground">{ui.pending}</p>
        )}
      </div>
    </article>
  )
}
