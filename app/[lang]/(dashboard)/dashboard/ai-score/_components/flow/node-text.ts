import { concentration } from "@/lib/ai/plan-score/distribution"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import { formatNumber, formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Locale } from "@/lib/i18n/locales"
import { levelName, optionName, outcomeName } from "./flow-labels"
import type { BranchView, GateView, JudgementView } from "./flow-model"

/**
 * The result of a node as one line of text, and how certain Jev was: the same words on the node,
 * in the table view and for assistive tech, so the graph never says more than its text twin.
 */
type Copy = Dictionary<"ai-score">

export interface NodeText {
  result: string
  /** A probability or confidence, or null when nothing was decided by the model. */
  certainty: string | null
}

export const oneDecimal = (value: number, lang: Locale) => formatNumber(value, lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** The level a judgement counts with: its expected level, 0 when empty, null when refused. */
export const countedLevel = (node: JudgementView): number | null => (node.source === "model" ? node.level : node.source === "empty" ? 0 : null)

export function judgementText(node: JudgementView, copy: Copy, lang: Locale): NodeText {
  const level = countedLevel(node)
  const result =
    node.source === "empty"
      ? copy.flow.node.empty
      : level === null
        ? copy.flow.node.refused
        : interpolate(copy.flow.node.level, { level: oneDecimal(level, lang), name: levelName(copy.labels, level) })
  return { result, certainty: node.probabilities ? formatPercent(concentration(node.probabilities), lang) : null }
}

export function gateText(node: GateView, copy: Copy, lang: Locale): NodeText {
  const outcome = outcomeName(copy.labels, node.outcome)
  const result =
    node.source === "refused"
      ? copy.labels.gateSources.refused
      : node.cap !== null
        ? interpolate(copy.flow.node.capApplied, { outcome, level: node.cap })
        : node.probability !== null
          ? interpolate(copy.flow.node.probability, { outcome, value: formatPercent(node.probability, lang) })
          : outcome
  return { result, certainty: node.probability === null ? null : formatPercent(node.probability, lang) }
}

export function branchText(node: BranchView, copy: Copy, lang: Locale): NodeText {
  if (node.choice === "refused") return { result: copy.labels.gateSources.refused, certainty: null }
  const sure = node.probabilities[node.choice]
  return { result: optionName(copy.labels, node.id, node.choice), certainty: sure === undefined ? null : formatPercent(sure, lang) }
}
