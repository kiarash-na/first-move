"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { DemandByTypeRow } from "@/lib/dashboard/overview"
import { formatEnergy } from "@/lib/i18n/format"
import { CONSTRUCTION_PERIODS } from "@/lib/project/catalog/construction-periods"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { BAR_GAP, BAR_SIZE, barChartHeight, CATEGORY_AXIS, GRID, niceMax, ramp, VALUE_AXIS } from "../../../_components/charts"

/**
 * Demand per building type, stacked by construction period. The periods are ordered, so they
 * get one hue from light (oldest) to dark (newest), orange for heating and cyan for cooling.
 */
export default function DemandChart({ rows, tone }: { rows: DemandByTypeRow[]; tone: "cool" | "hot" }) {
  const lang = useLocale()
  const copy = useDictionary("quick-check")
  const shades = ramp(tone, CONSTRUCTION_PERIODS.length)
  // Industry has no default demand (OQ-02); a row without demand adds nothing to the plot.
  const visible = rows.filter((row) => row.total > 0)

  const config: ChartConfig = {}
  CONSTRUCTION_PERIODS.forEach((period, index) => {
    config[period] = { label: copy.periods[period].label, color: shades[index] }
  })
  const data = visible.map((row) => ({ name: copy.buildingTypes[row.type].label, ...row.periods }))

  return (
    <ChartContainer config={config} id={`demand-${tone}`} className="aspect-auto w-full" style={{ height: barChartHeight(Math.max(visible.length, 1), 56) }}>
      <BarChart accessibilityLayer layout="vertical" data={data} margin={{ left: 0, right: 16, top: 4, bottom: 0 }} barCategoryGap="34%">
        <CartesianGrid {...GRID} />
        <YAxis {...CATEGORY_AXIS} dataKey="name" width={92} />
        <XAxis {...VALUE_AXIS} domain={[0, niceMax(Math.max(...visible.map((row) => row.total), 0))]} tickFormatter={(value: number) => formatEnergy(value, lang, { fractionDigits: 1 })} />
        <ChartTooltip cursor={{ fill: "var(--muted)", fillOpacity: 0.5 }} content={<ChartTooltipContent valueFormatter={(value) => formatEnergy(value, lang, { perYear: true })} />} />
        {CONSTRUCTION_PERIODS.map((period) => (
          <Bar key={period} dataKey={period} stackId="period" fill={`var(--color-${period})`} barSize={BAR_SIZE} {...BAR_GAP} />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
