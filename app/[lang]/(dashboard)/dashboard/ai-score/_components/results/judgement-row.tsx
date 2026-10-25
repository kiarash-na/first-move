"use client"

import { ChevronDownIcon, HistoryIcon } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { levelVariance } from "@/lib/ai/plan-score/distribution"
import { WEAK_LEVEL } from "@/lib/ai/plan-score/report"
import { LEVEL_IDS, MAX_LEVEL } from "@/lib/ai/plan-score/scale"
import { formatNumber, formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { AiJudgement } from "@/lib/project"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import type { ResultActions } from "../types"
import { partAnchor } from "./anchors"
import { ConfidenceMeter } from "./confidence-meter"
import { digitsBeside, nearestLevel } from "./display"
import { LevelHistogram } from "./level-histogram"
import { AiBadge } from "./ai-badge"
import { stepsOf } from "./plan-steps"
import { StepLinks } from "./step-links"
import { SuggestButton } from "./suggest-button"
import { SuggestionTexts } from "./suggestion-texts"

/**
 * One plan part (judgement) as Jev scored it: the level name of the nearest level with the
 * expected level to one decimal, the five probabilities as a mini histogram, how sure Jev was, the
 * source, a changed marker and the edit link. Expanded: what each level means with its
 * probability, the saved suggestions and, for a weak part, "Suggest improvements" (D-77). An empty
 * part was never sent to Jev, so it shows its level without Jev's histogram or confidence.
 */
export function JudgementRow({
  entry,
  name,
  changed,
  suggestions,
  suggestionsLang,
  actions,
}: {
  entry: AiJudgement
  name: string
  changed: boolean
  suggestions: readonly string[]
  /** The language the saved suggestions were written in, when it may differ from the page's. */
  suggestionsLang?: string
  actions: ResultActions
}) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const text = copy.results.parts
  const probabilities = entry.source === "empty" ? null : entry.probabilities
  const level = entry.level
  const weak = level !== null && level < WEAK_LEVEL
  const levelName = level === null ? null : copy.labels.levels[nearestLevel(level)].name
  // A weak level keeps the digits that keep it below WEAK_LEVEL: 1.96, not 2.0.
  const digits = level !== null && weak ? digitsBeside(level, [WEAK_LEVEL], 1, 3) : 1
  const levelValue = level === null ? null : formatNumber(level, lang, { minimumFractionDigits: 1, maximumFractionDigits: digits })
  const nearest = level === null ? null : Math.round(level)

  return (
    <li id={partAnchor(entry.id)} data-part={entry.id} data-source={entry.source} data-weak={weak || undefined} className="scroll-mt-24 py-3">
      <Collapsible className="group/part flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex min-w-0 flex-1 basis-48 flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-[15px] leading-snug font-[520]">{name}</span>
            {changed && (
              <span data-changed className="inline-flex items-center gap-1 border border-hot px-1.5 py-0.5 font-mono text-[11px] tracking-[0.06em] text-hot uppercase">
                <HistoryIcon className="size-3" strokeWidth={1.8} aria-hidden="true" />
                {text.changed}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-mono text-sm tabular-nums sm:w-36 sm:text-right" data-level-text>
              {levelName === null ? (
                <span className="text-muted-foreground">{copy.labels.fieldSources.refused}</span>
              ) : (
                <>
                  <span className="sr-only">{interpolate(text.levelLabel, { value: levelValue!, max: formatNumber(MAX_LEVEL, lang), name: levelName })}</span>
                  <span aria-hidden="true">{interpolate(text.level, { name: levelName, value: levelValue! })}</span>
                </>
              )}
            </span>
            {probabilities ? <LevelHistogram probabilities={probabilities} expected={level} /> : <span className="w-[5.5rem]" aria-hidden="true" />}
            {probabilities ? <ConfidenceMeter probabilities={probabilities} /> : <span className="w-24" aria-hidden="true" />}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4">
          <span className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
            <span data-source-label>{copy.labels.fieldSources[entry.source]}</span>
            {weak && <span className="font-mono text-hot">{interpolate(text.weak, { level: formatNumber(WEAK_LEVEL, lang) })}</span>}
            <StepLinks steps={stepsOf(entry.fields)} template={text.edit} />
          </span>
          <CollapsibleTrigger
            aria-label={interpolate(text.detailsOf, { name })}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase transition-colors duration-[180ms] hover:text-foreground data-[state=open]:text-hot"
          >
            {text.details}
            <ChevronDownIcon className="size-4 transition-transform duration-[220ms] ease-signature group-data-[state=open]/part:rotate-180" strokeWidth={1.6} aria-hidden="true" />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
          <div className="flex flex-col gap-4 border-l-2 border-hot bg-muted/40 px-4 py-4">
            {entry.source === "empty" && <p className="text-sm text-text-secondary">{text.empty}</p>}
            {entry.source === "refused" && <p className="text-sm text-text-secondary">{text.refused}</p>}
            {entry.source === "model" && !entry.probabilities && <p className="text-sm text-text-secondary">{text.noDistribution}</p>}
            {changed && <p className="text-sm text-hot">{text.changedNote}</p>}
            {probabilities && (
              <p className="font-mono text-xs text-muted-foreground">
                {interpolate(text.spread, { value: formatNumber(Math.sqrt(levelVariance(probabilities)), lang, { maximumFractionDigits: 1, minimumFractionDigits: 1 }) })}
              </p>
            )}
            <div className="flex flex-col gap-2">
              <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{text.levels}</p>
              <ol className="flex flex-col divide-y divide-border border-y">
                {LEVEL_IDS.map((id, index) => (
                  <li key={id} data-level-row={index} data-nearest={index === nearest || undefined} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1 py-2 text-sm [grid-template-areas:'num_prob'_'text_text'] sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:[grid-template-areas:'num_text_prob']">
                    <span className="font-mono text-xs text-muted-foreground [grid-area:num]">{interpolate(text.levelNumber, { number: formatNumber(index, lang) })}</span>
                    <span className={cn("leading-snug [grid-area:text]", index === nearest ? "text-foreground" : "text-text-secondary")}>
                      <span className={cn(index === nearest && "font-semibold")}>{copy.labels.levels[id].name}</span>
                      {" · "}
                      {copy.labels.levels[id].description}
                    </span>
                    <span className="text-right font-mono text-xs tabular-nums [grid-area:prob]">{probabilities ? formatPercent(probabilities[index], lang) : ""}</span>
                  </li>
                ))}
              </ol>
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{text.suggestions}</p>
                  <AiBadge />
                </div>
                <SuggestionTexts texts={suggestions} lang={suggestionsLang} />
              </div>
            )}
            {weak && <SuggestButton actions={actions} keys={[entry.id]} label={text.suggest} name={interpolate(text.suggestFor, { name })} />}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}
