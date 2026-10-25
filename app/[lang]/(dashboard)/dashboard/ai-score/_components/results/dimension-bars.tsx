"use client"

import { MAX_LEVEL } from "@/lib/ai/plan-score/scale"
import { formatNumber, formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { AiDimension } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { clampPoints, POINTS_PER_LEVEL, toPoints } from "./display"

/** Gridlines at every evidence level: a dimension score is POINTS_PER_LEVEL × level. */
const LEVEL_LINES = Array.from({ length: MAX_LEVEL + 1 }, (_, level) => level * POINTS_PER_LEVEL)
const pct = (points: number) => `${clampPoints(points)}%`

/**
 * The seven dimensions as horizontal bars on the 0..100 scale (PLAN-AI-SCORE-01 § Aggregation):
 * the score in orange, the mean before a cap as a paler ghost behind it, the cap of a failed check
 * as a line at cap × 25, a whisker of ± one standard deviation and the weight. Every number is
 * text in the row, the score before a cap included; the marks are decorative (the table view
 * carries the same data).
 */
export function DimensionBars({ dimensions }: { dimensions: readonly AiDimension[] }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const text = copy.results.dimensions
  const points = (unit: number) => formatNumber(toPoints(unit), lang, { maximumFractionDigits: 0 })

  return (
    <div data-slot="dimension-bars" className="flex flex-col">
      <ul className="flex flex-col divide-y divide-border">
        {dimensions.map((dimension) => {
          const name = (copy.labels.dimensions as Record<string, { name: string } | undefined>)[dimension.id]?.name
          if (!name) return null
          const score = toPoints(dimension.score)
          const raw = toPoints(dimension.raw)
          const sd = toPoints(dimension.sd)
          return (
            <li
              key={dimension.id}
              data-dimension={dimension.id}
              className="grid items-center gap-x-5 gap-y-2 py-3 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_8rem]"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm leading-snug">{name}</span>
                <span className="font-mono text-xs text-muted-foreground">{interpolate(text.weight, { value: formatPercent(dimension.weight, lang) })}</span>
              </div>
              <div aria-hidden="true" className="relative h-7">
                {LEVEL_LINES.map((at) => (
                  <span key={at} className="absolute inset-y-0 w-px bg-border" style={{ left: pct(at) }} />
                ))}
                {raw > score && (
                  <span data-raw className="absolute top-1/2 left-0 h-3 -translate-y-1/2 bg-chart-4" style={{ width: pct(raw) }} />
                )}
                <span
                  data-measure
                  className="absolute top-1/2 left-0 h-3 -translate-y-1/2 bg-hot transition-[width] duration-[240ms] ease-signature"
                  style={{ width: pct(score) }}
                />
                {dimension.cap !== null && (
                  <span data-cap className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-foreground" style={{ left: pct(dimension.cap * POINTS_PER_LEVEL) }} />
                )}
                {sd > 0 && (
                  <span
                    data-whisker
                    className="absolute top-1/2 h-2.5 -translate-y-1/2 border-x border-foreground/70 before:absolute before:inset-x-0 before:top-1/2 before:h-px before:bg-foreground/70"
                    style={{ left: pct(score - sd), width: `${clampPoints(score + sd) - clampPoints(score - sd)}%` }}
                  />
                )}
              </div>
              <div className="flex flex-col items-start gap-0.5 sm:items-end">
                <span className="font-mono text-sm tabular-nums">{interpolate(text.value, { score: points(dimension.score), sd: points(dimension.sd) })}</span>
                {dimension.cap !== null && (
                  <span className="font-mono text-xs text-hot">{interpolate(text.capped, { level: formatNumber(dimension.cap, lang) })}</span>
                )}
                {raw > score && <span data-raw-text className="font-mono text-xs text-muted-foreground">{interpolate(text.before, { value: points(dimension.raw) })}</span>}
              </div>
            </li>
          )
        })}
      </ul>
      <div aria-hidden="true" className="hidden gap-x-5 sm:grid sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_8rem]">
        <span />
        <div className="relative h-4 font-mono text-xs text-muted-foreground tabular-nums">
          {LEVEL_LINES.map((at, index) => (
            <span
              key={at}
              className={index === 0 ? "absolute left-0" : index === LEVEL_LINES.length - 1 ? "absolute right-0" : "absolute -translate-x-1/2"}
              style={index === 0 || index === LEVEL_LINES.length - 1 ? undefined : { left: pct(at) }}
            >
              {formatNumber(at, lang)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
