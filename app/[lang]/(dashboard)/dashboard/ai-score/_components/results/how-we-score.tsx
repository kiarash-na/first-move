"use client"

import { CalculatorIcon, ChevronDownIcon } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PROMISING_FROM, SOLID_FROM } from "@/lib/ai/plan-score/aggregate"
import { BRANCHES } from "@/lib/ai/plan-score/branches"
import { DIMENSIONS } from "@/lib/ai/plan-score/dimensions"
import { GATE_FAIL, GATE_PASS, OPTION_WEIGHT } from "@/lib/ai/plan-score/gates"
import { TURNS } from "@/lib/ai/plan-score/judgements"
import { LEVEL_COUNT, LEVEL_IDS, MAX_LEVEL } from "@/lib/ai/plan-score/scale"
import { joinList } from "@/lib/dashboard/result-text"
import { formatNumber, formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { MIN_BAND, POINTS_PER_LEVEL, ROUNDING_STEP } from "./display"
import { CAP_LEVELS } from "./gate-info"
import { HowBlock } from "./how-block"
import { branchCopy } from "./labels"

const FORMULAS = ["expected", "partSpread", "dimensionLevel", "dimensionScore", "dimensionSpread", "score", "band", "choicePass"] as const
/** Turn 0 reads the plan without AI; then one turn per Business Plan step (`run.ts`). */
const RUN_TURNS = [0, ...TURNS] as const
const CAVEATS = ["calibration", "opinion", "length"] as const

/**
 * "How we score" (D-33), collapsed: the evidence levels, the turns, checks and caps, branches, the
 * formulas, the weights, the label thresholds and the caveats. Every number is imported from the
 * engine (scale, gates, branches, aggregate, dimensions), never retyped. Its title is a heading,
 * so its blocks sit under it in the page outline.
 */
export function HowWeScore() {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const how = copy.results.how
  const number = (value: number) => formatNumber(value, lang)
  const levels = { promising: number(PROMISING_FROM), solid: number(SOLID_FROM) }
  const branchNames = BRANCHES.flatMap((branch) => {
    const name = branchCopy(copy.labels, branch.id)?.name
    return name ? [interpolate(how.branches.name, { name })] : []
  })
  const formulaValues = {
    max: number(MAX_LEVEL),
    perLevel: number(POINTS_PER_LEVEL),
    pass: number(OPTION_WEIGHT.pass),
    partial: number(OPTION_WEIGHT.partial),
    fail: number(OPTION_WEIGHT.fail),
  }

  return (
    <Collapsible data-slot="how-we-score" className="group/how border bg-card px-5 py-1 sm:px-6">
      <h3>
        <CollapsibleTrigger className="inline-flex min-h-12 w-full cursor-pointer items-center gap-2.5 font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase transition-colors duration-[180ms] hover:text-foreground data-[state=open]:text-hot">
          <CalculatorIcon className="size-4" strokeWidth={1.6} aria-hidden="true" />
          {how.title}
          <ChevronDownIcon className="ml-auto size-4 transition-transform duration-[220ms] ease-signature group-data-[state=open]/how:rotate-180" strokeWidth={1.6} aria-hidden="true" />
        </CollapsibleTrigger>
      </h3>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
        <div className="mb-5 flex flex-col gap-6 border-l-2 border-hot bg-muted/40 px-4 py-5 sm:px-5">
          <p className="max-w-[72ch] text-sm leading-relaxed text-text-secondary">{how.lead}</p>

          <HowBlock title={interpolate(how.levels.title, { count: number(LEVEL_COUNT) })}>
            <p className="max-w-[72ch] text-sm text-text-secondary">{how.levels.lead}</p>
            <ol className="flex flex-col divide-y divide-border border-y">
              {LEVEL_IDS.map((id, level) => (
                <li key={id} data-level={level} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 py-2 text-sm">
                  <span className="font-mono text-hot tabular-nums">{number(level)}</span>
                  <span>
                    <span className="font-semibold">{copy.labels.levels[id].name}</span> · {copy.labels.levels[id].description}
                  </span>
                </li>
              ))}
            </ol>
          </HowBlock>

          <HowBlock title={how.turns.title}>
            <p className="max-w-[72ch] text-sm text-text-secondary">{how.turns.lead}</p>
            <ol className="flex flex-wrap gap-2">
              {RUN_TURNS.map((turn) => (
                <li key={turn} data-turn={turn} className="border px-2 py-1 font-mono text-xs">
                  {number(turn)} · {copy.labels.turns[String(turn) as keyof typeof copy.labels.turns]}
                </li>
              ))}
            </ol>
          </HowBlock>

          <HowBlock title={how.checks.title}>
            <p data-checks className="max-w-[72ch] text-sm text-text-secondary">
              {interpolate(how.checks.body, {
                pass: number(GATE_PASS),
                fail: number(GATE_FAIL),
                caps: CAP_LEVELS.map(number).join(` ${how.checks.or} `),
                mustHave: number(CAP_LEVELS[0]),
                solid: copy.labels.scoreLevels.solid.name,
              })}
            </p>
          </HowBlock>

          <HowBlock title={how.branches.title}>
            <p className="max-w-[72ch] text-sm text-text-secondary">{interpolate(how.branches.body, { names: joinList(branchNames, lang) })}</p>
          </HowBlock>

          <HowBlock title={how.formulas.title}>
            <dl className="flex flex-col divide-y divide-border border-y">
              {FORMULAS.map((id) => (
                <div key={id} data-formula={id} className="grid gap-x-6 gap-y-1 py-2.5 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
                  <dt className="text-sm">{how.formulas[id].name}</dt>
                  <dd className="font-mono text-sm break-words">{interpolate(how.formulas[id].formula, formulaValues)}</dd>
                </div>
              ))}
            </dl>
            <p className="max-w-[72ch] text-xs leading-relaxed text-muted-foreground">{how.formulas.note}</p>
          </HowBlock>

          <HowBlock title={how.weights.title}>
            <p className="text-sm text-text-secondary">{interpolate(how.weights.lead, { total: formatPercent(DIMENSIONS.reduce((sum, entry) => sum + entry.weight, 0), lang) })}</p>
            <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
              {DIMENSIONS.map((dimension) => (
                <li key={dimension.id} data-weight={dimension.id} className="flex justify-between gap-3 border-b py-1.5 text-sm">
                  <span>{copy.labels.dimensions[dimension.id].name}</span>
                  <span className="font-mono tabular-nums">{formatPercent(dimension.weight, lang)}</span>
                </li>
              ))}
            </ul>
          </HowBlock>

          <HowBlock title={how.labels.title}>
            <ul className="flex flex-col gap-1 text-sm">
              {(["early", "promising", "solid"] as const).map((id) => (
                <li key={id} data-label={id}>
                  <span className="font-semibold">{copy.labels.scoreLevels[id].name}</span> · {interpolate(how.labels[id], levels)}
                </li>
              ))}
            </ul>
            <p className="max-w-[72ch] text-xs leading-relaxed text-muted-foreground">{interpolate(how.labels.rounding, { step: number(ROUNDING_STEP), minBand: number(MIN_BAND) })}</p>
          </HowBlock>

          <HowBlock title={how.caveats.title}>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-snug">
              {CAVEATS.map((id) => (
                <li key={id}>{how.caveats[id]}</li>
              ))}
            </ul>
          </HowBlock>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
