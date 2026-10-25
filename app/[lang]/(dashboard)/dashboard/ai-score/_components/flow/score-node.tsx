"use client"

import { SigmaIcon } from "lucide-react"

import { displayScore } from "@/lib/business-plan"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import type { AggregateView } from "./aggregate-view"
import { FlowNodeButton } from "./flow-node-button"

/**
 * The end of the aggregation: the AI Plan Score rounded to 5 points with its band of one standard
 * deviation (QCT-RES-LEVELS: no false precision) and its label; a failed must-have check keeps it
 * below Solid.
 */
export function ScoreNode({ result }: { result: AggregateView }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const text = copy.flow
  const shown = displayScore(result.score, result.sd)
  const label = copy.labels.scoreLevels[result.level]
  const value = interpolate(text.node.score, { score: formatNumber(shown.score, lang), band: formatNumber(shown.band, lang) })

  return (
    <FlowNodeButton
      nodeKey="score:final"
      kind={text.detail.kinds.score}
      title={`${text.node.final}: ${value}`}
      data={{ score: shown.score, level: result.level, capped: result.capped || undefined }}
      className="border-hot"
      trigger={
        <span className="flex min-w-0 flex-1 items-start gap-2.5 px-3 py-2.5">
          <SigmaIcon className="mt-1 size-4 shrink-0 text-hot" strokeWidth={1.8} aria-hidden="true" />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="font-mono text-xs tracking-[0.06em] text-text-secondary uppercase">{text.node.final}</span>
            <span className="text-2xl leading-tight font-[600] tracking-[-0.03em]">{value}</span>
            <span className="text-sm font-[560]">{label.name}</span>
          </span>
        </span>
      }
    >
      <p>{label.description}</p>
      {result.capped && <p className="text-hot">{text.node.capped}</p>}
      <p className="text-text-secondary">{text.detail.roundedNote}</p>
    </FlowNodeButton>
  )
}
