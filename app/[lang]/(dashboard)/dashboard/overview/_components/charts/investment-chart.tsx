"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { Part, InvestmentId } from "@/lib/dashboard/overview"
import { formatEur } from "@/lib/i18n/format"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { BAR_GAP, BAR_SIZE, barChartHeight, CATEGORY_AXIS, GRID, niceMax, SERIES, VALUE_AXIS } from "../../../_components/charts"

/** Where the overall investment goes: one orange bar per part, the value at the tip of each. */
export default function InvestmentChart({ parts }: { parts: Part<InvestmentId>[] }) {
  const lang = useLocale()
  const labels = useDictionary("overview").charts.investment
  const config = { value: { label: labels.amount, color: SERIES.hot } } satisfies ChartConfig
  const rows = parts.map((part) => ({ name: labels.parts[part.id], value: part.value }))

  return (
    <ChartContainer config={config} id="investment" className="aspect-auto w-full" style={{ height: barChartHeight(rows.length) }}>
      <BarChart accessibilityLayer layout="vertical" data={rows} margin={{ left: 0, right: 64, top: 4, bottom: 0 }} barCategoryGap="34%">
        <CartesianGrid {...GRID} />
        <YAxis {...CATEGORY_AXIS} dataKey="name" width={100} />
        <XAxis {...VALUE_AXIS} domain={[0, niceMax(Math.max(...parts.map((part) => part.value)))]} tickFormatter={(value: number) => formatEur(value, lang, { compact: true })} />
        <ChartTooltip cursor={{ fill: "var(--muted)", fillOpacity: 0.5 }} content={<ChartTooltipContent valueFormatter={(value) => formatEur(value, lang)} />} />
        <Bar dataKey="value" fill="var(--color-value)" barSize={BAR_SIZE} {...BAR_GAP}>
          <LabelList dataKey="value" position="right" className="fill-foreground font-mono text-xs" formatter={(value) => formatEur(Number(value), lang, { compact: true })} />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
