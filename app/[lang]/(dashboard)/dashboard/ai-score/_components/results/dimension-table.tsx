"use client"

import { EMPTY_VALUE, formatNumber, formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { AiScore } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { ChartTable } from "../../../_components/charts/chart-table"
import { POINTS_PER_LEVEL, toPoints } from "./display"

/**
 * The table view of the dimension bars (the WCAG-clean twin, dataviz): score, mean before a cap,
 * the cap, the spread, the weight and the weighted points, with the AI Plan Score as the total.
 */
export function DimensionTable({ score }: { score: AiScore }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const table = copy.results.dimensions.table
  const points = (value: number, digits = 0) => formatNumber(value, lang, { maximumFractionDigits: digits, minimumFractionDigits: digits })

  const rows = score.dimensions.flatMap((dimension) => {
    const name = (copy.labels.dimensions as Record<string, { name: string } | undefined>)[dimension.id]?.name
    if (!name) return []
    return [
      {
        key: dimension.id,
        label: name,
        cells: [
          points(toPoints(dimension.score)),
          points(toPoints(dimension.raw)),
          dimension.cap === null ? EMPTY_VALUE : interpolate(table.capValue, { level: formatNumber(dimension.cap, lang), points: formatNumber(dimension.cap * POINTS_PER_LEVEL, lang) }),
          points(toPoints(dimension.sd)),
          formatPercent(dimension.weight, lang),
          points(dimension.weight * toPoints(dimension.score), 1),
        ],
      },
    ]
  })

  return (
    <ChartTable
      caption={table.caption}
      heading={table.heading}
      columns={[table.score, table.raw, table.cap, table.sd, table.weight, table.points]}
      rows={rows}
      footer={{
        key: "total",
        label: table.total,
        cells: ["", "", "", "", formatPercent(score.dimensions.reduce((sum, dimension) => sum + dimension.weight, 0), lang), points(score.score, 1)],
      }}
    />
  )
}
