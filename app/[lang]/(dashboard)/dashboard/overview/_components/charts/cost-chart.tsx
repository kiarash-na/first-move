"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { CostStructure } from "@/lib/dashboard/overview"
import { formatEur, formatPercent } from "@/lib/i18n/format"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { BAR_GAP, BAR_SIZE, barChartHeight, barMotion, CATEGORY_AXIS, GRID, niceMax, SERIES, VALUE_AXIS } from "../../../_components/charts"

type Row = { name: string; value: number; label: string }

function CostBars({ id, rows, unitSuffix, label }: { id: string; rows: Row[]; unitSuffix: string; label: string }) {
  const lang = useLocale()
  const config = { value: { label, color: SERIES.hot } } satisfies ChartConfig
  return (
    <ChartContainer config={config} id={id} className="aspect-auto w-full" style={{ height: barChartHeight(rows.length, 46) }}>
      <BarChart accessibilityLayer layout="vertical" data={rows} margin={{ left: 0, right: 100, top: 4, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid {...GRID} />
        <YAxis {...CATEGORY_AXIS} dataKey="name" width={112} />
        <XAxis {...VALUE_AXIS} domain={[0, niceMax(Math.max(...rows.map((row) => row.value)))]} tickFormatter={(value: number) => formatEur(value, lang, { compact: true })} />
        <ChartTooltip cursor={{ fill: "var(--muted)", fillOpacity: 0.5 }} content={<ChartTooltipContent valueFormatter={(value) => `${formatEur(value, lang)}${unitSuffix}`} />} />
        <Bar dataKey="value" fill="var(--color-value)" barSize={BAR_SIZE} {...BAR_GAP} {...barMotion()}>
          <LabelList dataKey="label" position="right" className="fill-foreground font-mono text-xs" />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

/** The annual costs by component and the investment down to each source, as two small multiples of orange bars. */
export default function CostChart({ data }: { data: CostStructure }) {
  const lang = useLocale()
  const overview = useDictionary("overview")
  const copy = overview.charts.more.cost
  const economics = overview.charts.economics
  const sources = useDictionary("quick-check").sources
  const investment = overview.charts.investment.parts

  const annual: Row[] = data.annual.map((part) => ({
    name: economics.cost[part.id],
    value: part.value,
    label: `${formatEur(part.value, lang, { compact: true })} · ${formatPercent(part.share, lang)}`,
  }))
  const items: Row[] = data.investment.map((item) => ({
    name: item.id === "heatPump" || item.id === "network" ? investment[item.id] : sources[item.id].label,
    value: item.value,
    label: formatEur(item.value, lang, { compact: true }),
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-2">
        <h4 className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">{copy.annual}</h4>
        <CostBars id="cost-annual" rows={annual} unitSuffix={overview.kpi.perYear} label={copy.annual} />
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">{copy.investment}</h4>
        <CostBars id="cost-investment" rows={items} unitSuffix="" label={copy.investment} />
      </div>
    </div>
  )
}
