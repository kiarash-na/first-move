"use client"

import { judgementOf, TURNS } from "@/lib/ai/plan-score/judgements"
import { LEVEL_COUNT } from "@/lib/ai/plan-score/scale"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { AiScore } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import type { ResultActions } from "../types"
import { JudgementRow } from "./judgement-row"
import { judgementName } from "./labels"
import { ResultsSection } from "./results-section"

/**
 * Every plan part (judgement) of the run, grouped by the turn that judged it: one turn per
 * Business Plan step (BM-STEP-01..04), in the order of the plan.
 */
export function JudgementsPanel({ score, changed, actions }: { score: AiScore; changed: readonly string[]; actions: ResultActions }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const text = copy.results.parts
  const saved = new Map((score.suggestions?.items ?? []).map((item) => [item.key, item.texts]))
  const groups = TURNS.map((turn) => ({
    turn,
    entries: score.judgements.flatMap((entry) => {
      const name = judgementName(copy.labels, entry.id)
      return judgementOf(entry.id)?.turn === turn && name ? [{ entry, name }] : []
    }),
  })).filter((group) => group.entries.length > 0)

  return (
    <ResultsSection title={text.title} lead={interpolate(text.lead, { count: formatNumber(LEVEL_COUNT, lang) })} data-slot="judgements-panel" data-ai-generated="true">
      <div className="flex flex-col gap-6">
        {groups.map(({ turn, entries }) => (
          <section key={turn} data-turn={turn} aria-labelledby={`ai-score-turn-${turn}`} className="flex flex-col">
            <h4 id={`ai-score-turn-${turn}`} className="font-mono text-xs tracking-[0.075em] text-hot uppercase">
              {interpolate(text.turn, { turn: formatNumber(turn, lang), name: copy.labels.turns[String(turn) as keyof typeof copy.labels.turns] })}
            </h4>
            <ul className="flex flex-col divide-y divide-border border-b">
              {entries.map(({ entry, name }) => (
                <JudgementRow
                  key={entry.id}
                  entry={entry}
                  name={name}
                  changed={changed.includes(entry.id)}
                  suggestions={saved.get(entry.id) ?? []}
                  suggestionsLang={score.suggestions?.lang}
                  actions={actions}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </ResultsSection>
  )
}
