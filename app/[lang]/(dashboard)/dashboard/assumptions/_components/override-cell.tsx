"use client"

import { formatInputNumber } from "@/lib/dashboard/number-input"
import { EMPTY_VALUE, formatNumber } from "@/lib/i18n/format"
import { getAt, getField, parsePath } from "@/lib/project"
import { cn } from "@/lib/utils"
import { isNumberField, NumberField } from "../../_components/fields/number-field"
import { useLocale } from "../../_components/i18n-provider"
import { useStoreState } from "../../_components/store-provider"

/**
 * One TBL-4/5/6 value: the default, or while playing (D-10) an input whose placeholder is the
 * default. An empty input keeps the default; a custom value is marked in orange. A cell without
 * a default and without a registry field (a dash, OQ-13) is never editable.
 */
export function OverrideCell({
  fieldId,
  defaultValue,
  label,
  playing,
  dash,
}: {
  fieldId: string | null
  defaultValue: number | null
  label: string
  playing: boolean
  /** Accessible text of a dash. */
  dash: string
}) {
  const lang = useLocale()
  const field = fieldId ? getField(fieldId) : undefined
  const custom = useStoreState((state) => (state.active && fieldId ? getAt(state.active, parsePath(fieldId) ?? []) !== null : false))

  if (!isNumberField(field)) {
    return (
      <span className="font-mono text-muted-foreground" title={dash}>
        <span aria-hidden="true">{EMPTY_VALUE}</span>
        <span className="sr-only">{dash}</span>
      </span>
    )
  }
  if (!playing) return <span className="font-mono tabular-nums">{formatNumber(defaultValue, lang)}</span>
  return (
    <div data-custom={custom || undefined} className={cn("min-w-[6.5rem] border-l-2 pl-1.5", custom ? "border-hot" : "border-transparent")}>
      <NumberField
        field={field}
        compact
        hideLabel
        label={label}
        tone="hot"
        placeholder={formatInputNumber(defaultValue, lang)}
        showUnit={false}
      />
    </div>
  )
}
