"use client"

import { formatDateTime, formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { AiScore } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"

/**
 * The facts of the run in one line: when, which method version, which decision model, which text
 * model wrote the report and how many tokens were used (score.usage).
 */
export function ScoreMeta({ score }: { score: AiScore }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score").results.meta
  const tokens = score.usage.decisionTokens + score.usage.textTokens
  const items = [
    interpolate(copy.date, { date: formatDateTime(score.at, lang) }),
    interpolate(copy.method, { version: score.method }),
    interpolate(copy.decisionModel, { model: score.decisionModel }),
    score.report ? interpolate(copy.textModel, { model: score.report.model }) : copy.noReport,
    `${interpolate(copy.tokens, { count: formatNumber(tokens, lang) })} (${interpolate(copy.tokensDetail, {
      decision: formatNumber(score.usage.decisionTokens, lang),
      text: formatNumber(score.usage.textTokens, lang),
    })})`,
  ]

  return (
    <ul aria-label={copy.label} data-slot="score-meta" className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs tracking-[0.03em] text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
