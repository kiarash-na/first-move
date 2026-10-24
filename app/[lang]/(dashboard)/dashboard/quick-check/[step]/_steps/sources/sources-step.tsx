"use client"

import { CircleAlertIcon } from "lucide-react"
import { fieldsOf, getGroup, groupRuleStatus, type ChoiceField, type SourceKey } from "@/lib/project"
import { interpolate } from "@/lib/i18n/interpolate"
import { formatNumber } from "@/lib/i18n/format"
import { useDictionary, useLocale, useTextRef } from "../../../../_components/i18n-provider"
import { useQuickCheck } from "../../../../_components/use-quick-check"
import { SourceCard } from "./source-card"

const GROUP = getGroup("sources.potentials")!
const SOURCE_FIELDS = fieldsOf({ module: "quickCheck", step: "sources", group: GROUP.id }).filter(
  (field): field is ChoiceField => field.kind === "choice",
)

/** Step 3, energy sources: one card per source with Low / Medium / High / Unknown (QCT-IN-06/07). */
export function SourcesStep() {
  const lang = useLocale()
  const text = useTextRef()
  const copy = useDictionary("quick-check").ui.sources
  const { project, result } = useQuickCheck()
  if (!project || !result) return null
  const selected = groupRuleStatus(project, GROUP)
  const title = text(GROUP.text) ?? undefined

  return (
    <section aria-labelledby="sources-title" data-slot="sources-step" className="flex flex-col gap-5">
      {/* Keeps the outline H1 → H2 → H3 (source names) without repeating the page title on screen. */}
      <h2 id="sources-title" className="sr-only">
        {title}
      </h2>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <p aria-live="polite" className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">
          {interpolate(copy.selected, { count: formatNumber(selected.value, lang), total: formatNumber(SOURCE_FIELDS.length, lang) })}
        </p>
      </div>
      {!selected.ok && (
        <p className="flex items-center gap-2 border border-dashed px-4 py-3 text-sm text-text-secondary">
          <CircleAlertIcon className="size-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
          {copy.none}
        </p>
      )}
      <div className="grid gap-4 @2xl:grid-cols-2">
        {SOURCE_FIELDS.map((field) => {
          const source = field.row as SourceKey
          return (
            <SourceCard
              key={field.id}
              field={field}
              heating={result.parameters.heating[source]}
              cooling={result.parameters.cooling[source]}
            />
          )
        })}
      </div>
    </section>
  )
}
