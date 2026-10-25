"use client"

import { LEVEL_IDS } from "@/lib/ai/plan-score/scale"
import { formatPercent } from "@/lib/i18n/format"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { levelFill } from "./level-ramp"

/**
 * The five-level probability histogram of one judgement, in a node's detail: a row per level with
 * its name, a thin bar on the level ramp and the share as text (the value is never colour-only).
 */
export function LevelHistogram({ probabilities, label }: { probabilities: readonly number[]; label: string }) {
  const lang = useLocale()
  const levels = useDictionary("ai-score").labels.levels
  const top = probabilities.indexOf(Math.max(...probabilities))

  return (
    <table data-slot="level-histogram" className="w-full border-collapse text-sm">
      <caption className="sr-only">{label}</caption>
      <tbody>
        {LEVEL_IDS.map((id, level) => {
          const p = probabilities[level] ?? 0
          return (
            <tr key={id} data-level={level} data-top={level === top || undefined}>
              <th scope="row" className="w-28 py-0.5 pr-2 text-left font-normal text-text-secondary">
                <span className="font-mono text-xs tabular-nums">{level}</span> {levels[id].name}
              </th>
              <td className="py-0.5">
                <span className="block h-2.5 bg-muted">
                  <span className="block h-full" style={{ width: `${Math.round(p * 100)}%`, background: levelFill(level) }} />
                </span>
              </td>
              <td className={`w-12 py-0.5 pl-2 text-right font-mono text-xs tabular-nums ${level === top ? "text-foreground" : "text-text-secondary"}`}>
                {formatPercent(p, lang)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
