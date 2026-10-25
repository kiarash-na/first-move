"use client"

import { BRANCHES } from "@/lib/ai/plan-score/branches"
import { formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { AiBranch } from "@/lib/project"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { checkAnchor } from "./anchors"
import { followUpOf } from "./gate-info"
import { branchCopy, gateCopy } from "./labels"

/**
 * One branch decision (PLAN-AI-SCORE-01 § Branches): the option Jev chose and how sure it was, a
 * bar for every option's probability (the chosen one in orange, the others grey: emphasis), and
 * the follow-up check it opened for the next turn.
 */
export function BranchDecision({ branch }: { branch: AiBranch }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const text = copy.results.checks
  const names = branchCopy(copy.labels, branch.id)
  const definition = BRANCHES.find((entry) => entry.id === branch.id)
  if (!names || !definition) return null

  const refused = !definition.options.some((option) => option.id === branch.choice)
  const followUp = refused ? null : followUpOf(branch.id, branch.choice)
  const followUpName = followUp ? gateCopy(copy.labels, followUp)?.name : null

  return (
    <li data-branch={branch.id} data-choice={branch.choice} className="flex flex-col gap-3 py-4">
      <div className="flex flex-col gap-1">
        <p className="text-[15px] leading-snug font-[520]">{names.name}</p>
        <p className="text-sm leading-snug text-text-secondary">{names.question}</p>
      </div>
      {refused ? (
        <p className="text-sm text-muted-foreground">{text.refusedBranch}</p>
      ) : (
        <>
          <p data-chosen className="flex flex-wrap items-baseline gap-x-3 text-sm">
            <span className="font-medium text-hot">{interpolate(text.chosen, { option: names.options[branch.choice] ?? "" })}</span>
            {branch.probabilities[branch.choice] !== undefined && (
              <span className="font-mono text-xs text-muted-foreground">{interpolate(text.chosenProbability, { value: formatPercent(branch.probabilities[branch.choice], lang) })}</span>
            )}
          </p>
          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{text.options}</p>
            <ul className="flex flex-col gap-1.5">
              {definition.options.map((option) => {
                const probability = branch.probabilities[option.id] ?? 0
                const chosen = option.id === branch.choice
                return (
                  <li key={option.id} data-option={option.id} className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)_3.5rem] items-center gap-x-3 text-sm">
                    <span className={cn("truncate", chosen ? "font-medium text-foreground" : "text-text-secondary")} title={names.options[option.id]}>
                      {names.options[option.id]}
                    </span>
                    <span aria-hidden="true" className="relative h-2.5 bg-foreground/[0.06]">
                      <span data-bar className={cn("absolute inset-y-0 left-0", chosen ? "bg-hot" : "bg-chart-5/45")} style={{ width: `${probability * 100}%` }} />
                    </span>
                    <span className="text-right font-mono text-xs tabular-nums">{formatPercent(probability, lang)}</span>
                  </li>
                )
              })}
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            {followUp && followUpName ? (
              <a href={`#${checkAnchor(followUp)}`} className="underline-offset-4 hover:text-hot hover:underline">
                {interpolate(text.opens, { check: followUpName })}
              </a>
            ) : (
              text.opensNone
            )}
          </p>
        </>
      )}
    </li>
  )
}
