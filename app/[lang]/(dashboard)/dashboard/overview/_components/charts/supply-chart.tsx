"use client"

import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { SupplyBySource } from "@/lib/dashboard/overview"
import { formatEnergy } from "@/lib/i18n/format"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { BAR_GAP, BAR_SIZE, barChartHeight, barMotion, CATEGORY_AXIS, GRID, niceMax, SERIES, VALUE_AXIS } from "../../../_components/charts"

/** What each selected source supplies, grouped heating (orange) and cooling (cyan), with both demands as solid reference lines. */
export default function SupplyChart({ data }: { data: SupplyBySource }) {
  const lang = useLocale()
  const copy = useDictionary("overview").charts.more.supply
  const sources = useDictionary("quick-check").sources
  const config = {
    heating: { label: copy.heatingSupply, color: SERIES.hot },
    cooling: { label: copy.coolingSupply, color: SERIES.cool },
  } satisfies ChartConfig
  const rows = data.rows.map((row) => ({ name: sources[row.source].label, heating: row.heatingKwh, cooling: row.coolingKwh }))
  const max = Math.max(data.heatingDemandKwh, data.coolingDemandKwh, ...rows.flatMap((row) => [row.heating, row.cooling]), 1)

  return (
    <ChartContainer config={config} id="supply" className="aspect-auto w-full" style={{ height: barChartHeight(rows.length, 64) }}>
      <BarChart accessibilityLayer layout="vertical" data={rows} margin={{ left: 0, right: 16, top: 4, bottom: 0 }} barCategoryGap="26%" barGap={2}>
        <CartesianGrid {...GRID} />
        <YAxis {...CATEGORY_AXIS} dataKey="name" width={112} />
        <XAxis {...VALUE_AXIS} domain={[0, niceMax(max)]} tickFormatter={(value: number) => formatEnergy(value, lang, { fractionDigits: 1 })} />
        <ChartTooltip cursor={{ fill: "var(--muted)", fillOpacity: 0.5 }} content={<ChartTooltipContent valueFormatter={(value) => formatEnergy(value, lang, { perYear: true })} />} />
        {data.heatingDemandKwh > 0 && <ReferenceLine x={data.heatingDemandKwh} stroke={SERIES.hot} strokeWidth={2} />}
        {data.coolingDemandKwh > 0 && <ReferenceLine x={data.coolingDemandKwh} stroke={SERIES.cool} strokeWidth={2} />}
        <Bar dataKey="heating" fill="var(--color-heating)" barSize={BAR_SIZE / 2 + 2} {...BAR_GAP} {...barMotion()} />
        <Bar dataKey="cooling" fill="var(--color-cooling)" barSize={BAR_SIZE / 2 + 2} {...BAR_GAP} {...barMotion()} />
      </BarChart>
    </ChartContainer>
  )
}
