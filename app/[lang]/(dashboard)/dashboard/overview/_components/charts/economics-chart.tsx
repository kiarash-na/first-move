"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { EconomicsData } from "@/lib/dashboard/overview"
import { formatEur } from "@/lib/i18n/format"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { BAR_GAP, BAR_SIZE, barChartHeight, barMotion, CATEGORY_AXIS, GRID, HatchDefs, niceMax, VALUE_AXIS } from "../../../_components/charts"
import { ECONOMICS_SERIES } from "./economics-series"

/** Revenues and annual costs as two stacked horizontal bars on one axis (never two axes). */
export default function EconomicsChart({ data }: { data: EconomicsData }) {
  const lang = useLocale()
  const copy = useDictionary("overview")
  const economics = copy.charts.economics

  const config: ChartConfig = {}
  for (const series of ECONOMICS_SERIES) {
    const label = series.group === "revenues" ? economics.revenue[series.part as "base"] : economics.cost[series.part as "annualized"]
    config[series.id] = { label, color: series.color }
  }

  const rows = [
    { name: economics.revenues, ...Object.fromEntries(data.revenues.map((part) => [`revenue-${part.id}`, part.value])) },
    { name: economics.costs, ...Object.fromEntries(data.costs.map((part) => [`cost-${part.id}`, part.value])) },
  ]

  return (
    <ChartContainer config={config} id="economics" className="aspect-auto w-full" style={{ height: barChartHeight(2, 64) }}>
      <BarChart accessibilityLayer layout="vertical" data={rows} margin={{ left: 0, right: 16, top: 4, bottom: 0 }} barCategoryGap="38%">
        <HatchDefs id="hatch-economics" />
        <CartesianGrid {...GRID} />
        <YAxis {...CATEGORY_AXIS} dataKey="name" width={112} />
        <XAxis {...VALUE_AXIS} domain={[0, niceMax(Math.max(data.revenueTotal, data.costTotal))]} tickFormatter={(value: number) => formatEur(value, lang, { compact: true })} />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", fillOpacity: 0.5 }}
          content={<ChartTooltipContent valueFormatter={(value) => `${formatEur(value, lang)}${copy.kpi.perYear}`} />}
        />
        {ECONOMICS_SERIES.map((series) => (
          <Bar
            key={series.id}
            dataKey={series.id}
            stackId="stack"
            fill={series.hatched ? "url(#hatch-economics)" : `var(--color-${series.id})`}
            barSize={BAR_SIZE}
            {...BAR_GAP} {...barMotion()}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
