"use client"

import { displayScore, PROMISING_FROM, SOLID_FROM } from "@/lib/ai/plan-score/aggregate"
import { formatNumber } from "@/lib/i18n/format"
import type { AiScoreLevel } from "@/lib/project"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { clampPoints } from "./display"

const ZONES: readonly { id: AiScoreLevel; from: number; to: number }[] = [
  { id: "early", from: 0, to: PROMISING_FROM },
  { id: "promising", from: PROMISING_FROM, to: SOLID_FROM },
  { id: "solid", from: SOLID_FROM, to: 100 },
]
/** Graduated greys, one hue: the zones darken towards Solid (dataviz: sequential, no status colours). */
const SHADE = ["bg-foreground/[0.05]", "bg-foreground/[0.09]", "bg-foreground/[0.14]"]
const TICKS = [0, PROMISING_FROM, SOLID_FROM, 100]
const pct = (points: number) => `${clampPoints(points)}%`

/**
 * The AI Plan Score on its 0..100 scale (PLAN-AI-SCORE-01 § Aggregation): the label zones
 * (Early < 40 ≤ Promising < 70 ≤ Solid, from the engine), the band of one standard deviation
 * shaded around the unrounded score (the range the caption states), and the score as a mark at
 * the number as shown (`displayScore`, rounded to 5), so the mark is always in the zone its
 * label names (D-81). The picture is decorative; the numbers and zones are text beside and below it.
 */
export function ScoreScale({ score, sd, level }: { score: number; sd: number; level: AiScoreLevel }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const shown = displayScore(score, sd).score
  const from = clampPoints(score - sd)
  const to = clampPoints(score + sd)

  return (
    <figure data-slot="score-scale" className="flex flex-col gap-2">
      <figcaption className="sr-only">{copy.results.summary.scale.label}</figcaption>
      <div aria-hidden="true" className="relative h-10">
        {ZONES.map((zone, index) => (
          <span
            key={zone.id}
            data-zone={zone.id}
            className={cn("absolute inset-y-0 border-r-2 border-card last:border-r-0", SHADE[index])}
            style={{ left: pct(zone.from), width: `${zone.to - zone.from}%` }}
          />
        ))}
        <span
          data-band
          className="absolute inset-y-2 border-x border-hot/70 bg-hot/25 transition-[left,width] duration-[240ms] ease-signature"
          style={{ left: pct(from), width: `${to - from}%` }}
        />
        <span
          data-marker
          className="absolute -inset-y-1.5 w-[3px] -translate-x-1/2 bg-hot transition-[left] duration-[240ms] ease-signature"
          style={{ left: pct(shown) }}
        />
      </div>
      <div aria-hidden="true" className="relative h-4 font-mono text-xs text-muted-foreground tabular-nums">
        {TICKS.map((tick) => (
          <span
            key={tick}
            className={cn("absolute whitespace-nowrap", tick === 0 ? "left-0" : tick === 100 ? "right-0" : "-translate-x-1/2")}
            style={tick === 0 || tick === 100 ? undefined : { left: pct(tick) }}
          >
            {formatNumber(tick, lang)}
          </span>
        ))}
      </div>
      <ul className="grid text-xs leading-tight" style={{ gridTemplateColumns: ZONES.map((zone) => `${zone.to - zone.from}fr`).join(" ") }}>
        {ZONES.map((zone) => (
          <li
            key={zone.id}
            data-current={zone.id === level || undefined}
            className={cn("min-w-0 px-1 text-center break-words hyphens-auto first:pl-0 first:text-left last:pr-0 last:text-right", zone.id === level ? "font-semibold text-foreground" : "text-muted-foreground")}
          >
            {copy.labels.scoreLevels[zone.id].name}
          </li>
        ))}
      </ul>
    </figure>
  )
}
