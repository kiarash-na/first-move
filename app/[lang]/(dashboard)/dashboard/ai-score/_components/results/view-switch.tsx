"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useDictionary } from "../../../_components/i18n-provider"

export type ResultView = "chart" | "table"

/**
 * The Chart / Table switch of a result chart, as in `ChartCard` (the table is the same data as
 * text, dataviz). Its own copy, because the AI Plan Score page does not load the overview area.
 */
export function ViewSwitch({ value, onChange }: { value: ResultView; onChange: (view: ResultView) => void }) {
  const copy = useDictionary("ai-score").results.dimensions.view
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      onValueChange={(next) => next && onChange(next as ResultView)}
      aria-label={copy.label}
      className="shrink-0"
    >
      <ToggleGroupItem value="chart" className="min-h-11 min-w-11">
        {copy.chart}
      </ToggleGroupItem>
      <ToggleGroupItem value="table" className="min-h-11 min-w-11">
        {copy.table}
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
