"use client"

import { LOW_HEAT_DENSITY } from "@/lib/ai/plan-score/gates"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { AiGate, AiScore } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import type { ResultActions } from "../types"
import { AiBadge } from "./ai-badge"
import { checkAnchor } from "./anchors"
import { CAP_LEVELS, gateInfo, openedBy } from "./gate-info"
import { branchCopy, gateCopy, optionName } from "./labels"
import { OutcomeTag } from "./outcome-tag"
import { PassMeter } from "./pass-meter"
import { SuggestButton } from "./suggest-button"
import { SuggestionTexts } from "./suggestion-texts"

/**
 * One check (gate) of the run (PLAN-AI-SCORE-01 § Gates): its outcome in words, the pass
 * probability as a meter, the cap it applied or could apply, how it was decided, its question and,
 * for a follow-up check, the decision that asked it. A failed or unclear check can get suggestions.
 * A conditional cap is a must-have only while its condition holds (the low Quick Check heat density).
 */
export function GateRow({
  gate,
  score,
  suggestions,
  suggestionsLang,
  actions,
}: {
  gate: AiGate
  score: AiScore
  suggestions: readonly string[]
  /** The language the saved suggestions were written in, when it may differ from the page's. */
  suggestionsLang?: string
  actions: ResultActions
}) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const text = copy.results.checks
  const info = gateInfo(gate.id)
  const names = gateCopy(copy.labels, gate.id)
  if (!info || !names) return null

  const dimension = copy.labels.dimensions[info.dimension].name
  const capHolds = !info.conditional || (score.quickCheck !== null && score.quickCheck.heatDensityMwhPerM < LOW_HEAT_DENSITY)
  const mustHave = info.effect.kind === "cap" && info.effect.level === CAP_LEVELS[0] && capHolds
  const opened = openedBy(score, gate.id)
  const effect =
    gate.cap !== null
      ? interpolate(text.capApplied, { dimension, level: formatNumber(gate.cap, lang) })
      : info.effect.kind === "flag"
        ? text.flag
        : interpolate(info.conditional ? text.capConditional : text.capPossible, { dimension, level: formatNumber(info.effect.level, lang) })
  const target = gate.outcome === "fail" || gate.outcome === "unclear"

  return (
    <li id={checkAnchor(gate.id)} data-check={gate.id} data-outcome={gate.outcome} className="flex scroll-mt-24 flex-col gap-3 py-4">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-1 basis-64 flex-col gap-1.5">
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-[15px] leading-snug font-[520]">{names.name}</span>
            {mustHave && <span className="border border-foreground/60 px-1.5 py-0.5 font-mono text-[11px] tracking-[0.06em] uppercase">{text.mustHave}</span>}
            {info.branch && <span className="border border-border px-1.5 py-0.5 font-mono text-[11px] tracking-[0.06em] text-muted-foreground uppercase">{text.followUp}</span>}
          </p>
          <p className="max-w-[68ch] text-sm leading-snug text-text-secondary">{names.question}</p>
          <p data-effect className={gate.cap !== null ? "text-sm font-medium text-hot" : "text-sm text-muted-foreground"}>
            {effect}
          </p>
          <p className="flex flex-wrap gap-x-3 font-mono text-xs text-muted-foreground">
            <span>{interpolate(text.turn, { turn: formatNumber(info.turn, lang) })}</span>
            <span data-gate-source>{copy.labels.gateSources[gate.source]}</span>
            {opened && (
              <span data-opened-by>
                {interpolate(text.openedBy, {
                  branch: branchCopy(copy.labels, opened.branch)?.name ?? "",
                  option: optionName(copy.labels, opened.branch, opened.option) ?? "",
                })}
              </span>
            )}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-52">
          <OutcomeTag outcome={gate.outcome} label={gate.source === "refused" ? copy.labels.gateSources.refused : undefined} />
          {gate.probability !== null ? (
            <PassMeter probability={gate.probability} />
          ) : (
            <p className="text-xs text-muted-foreground">{interpolate(text.noProbability, { source: copy.labels.gateSources[gate.source] })}</p>
          )}
        </div>
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2 border-l-2 border-hot pl-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{text.suggestions}</p>
            <AiBadge />
          </div>
          <SuggestionTexts texts={suggestions} lang={suggestionsLang} />
        </div>
      )}
      {target && <SuggestButton actions={actions} keys={[gate.id]} label={text.suggest} name={interpolate(text.suggestFor, { name: names.name })} />}
    </li>
  )
}
