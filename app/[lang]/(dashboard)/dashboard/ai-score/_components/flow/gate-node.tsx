"use client"

import { interpolate } from "@/lib/i18n/interpolate"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { DetailList } from "./detail-list"
import { branchName, dimensionName, gateName, gateQuestion, optionName, outcomeName, turnName } from "./flow-labels"
import { nodeKey, type BranchView, type GateView } from "./flow-model"
import { FlowNodeButton } from "./flow-node-button"
import { GateGlyph } from "./gate-glyph"
import { gateText } from "./node-text"

/**
 * A check across the plan: a diamond whose shape tells the outcome, the name, and the outcome
 * with Jev's probability or the cap a failed check applies. Its detail shows the question, the
 * effect, how it was decided and, for a follow-up, which branch asked it.
 */
export function GateNode({ node, opener }: { node: GateView; opener?: BranchView | null }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const { labels } = copy
  const text = copy.flow
  const name = gateName(labels, node.id)
  const outcome = outcomeName(labels, node.outcome)
  const dimension = dimensionName(labels, node.dimension)
  const { result: status, certainty } = gateText(node, copy, lang)
  const effect =
    node.effect.kind === "flag"
      ? text.detail.flag
      : interpolate(node.effect.conditional ? text.detail.capConditional : text.detail.cap, { dimension, level: node.effect.level })

  return (
    <FlowNodeButton
      nodeKey={nodeKey("gate", node.id)}
      kind={node.branch ? text.detail.kinds.followUp : text.detail.kinds.gate}
      title={name}
      data={{ outcome: node.outcome, source: node.source, cap: node.cap ?? undefined, branch: node.branch ?? undefined }}
      className={cn(node.outcome === "skipped" && "border-dashed", node.outcome === "fail" && "border-hot/60")}
      trigger={
        <span className="flex min-w-0 flex-1 items-start gap-2.5 px-2.5 py-2">
          <span className="pt-0.5">
            <GateGlyph outcome={node.outcome} />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm leading-snug">{name}</span>
            <span className="font-mono text-xs tracking-[0.04em] text-text-secondary uppercase">{status}</span>
          </span>
        </span>
      }
    >
      {gateQuestion(labels, node.id) && <p className="text-text-secondary">{gateQuestion(labels, node.id)}</p>}
      <DetailList
        rows={[
          [text.detail.outcome, outcome],
          [text.detail.probability, certainty],
          [text.detail.source, labels.gateSources[node.source]],
          [text.detail.dimension, dimension],
          [text.detail.step, turnName(labels, node.turn)],
        ]}
      />
      <p>
        <span className="font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">{text.detail.effect}</span>
        <br />
        {effect}
      </p>
      {node.cap !== null && <p className="text-hot">{interpolate(text.detail.applied, { dimension, level: node.cap })}</p>}
      {opener && <p>{interpolate(text.detail.openedBy, { branch: branchName(labels, opener.id), option: optionName(labels, opener.id, opener.choice) })}</p>}
      {node.source === "rule" && <p>{text.detail.ruleNote}</p>}
      {node.outcome === "skipped" && node.source !== "refused" && <p>{text.detail.skippedNote}</p>}
      {node.source === "refused" && <p>{text.detail.refusedNote}</p>}
    </FlowNodeButton>
  )
}
