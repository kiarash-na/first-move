"use client"

import { levelVariance } from "@/lib/ai/plan-score/distribution"
import { interpolate } from "@/lib/i18n/interpolate"
import { cn } from "@/lib/utils"
import { HATCH_BACKGROUND } from "../../../_components/charts"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { DetailList } from "./detail-list"
import { dimensionName, judgementName, levelName, turnName } from "./flow-labels"
import type { JudgementView } from "./flow-model"
import { nodeKey } from "./flow-model"
import { FlowNodeButton } from "./flow-node-button"
import { LevelHistogram } from "./level-histogram"
import { levelFill } from "./level-ramp"
import { MiniHistogram } from "./mini-histogram"
import { countedLevel, judgementText, oneDecimal } from "./node-text"

/**
 * A plan part Jev rated (or an empty one, rated 0 without AI): a swatch on the orange level ramp
 * (hatched when empty, dashed when Jev gave no answer), the name, the expected level as text and
 * the five-level distribution in miniature. Its detail shows the full histogram and confidence.
 */
export function JudgementNode({ node }: { node: JudgementView }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const { labels } = copy
  const text = copy.flow
  const name = judgementName(labels, node.id)
  const level = countedLevel(node)
  const one = (value: number) => oneDecimal(value, lang)
  const { result: status, certainty } = judgementText(node, copy, lang)
  const swatch = node.source === "empty" ? { background: HATCH_BACKGROUND } : level === null ? undefined : { background: levelFill(level) }

  return (
    <FlowNodeButton
      nodeKey={nodeKey("judgement", node.id)}
      kind={text.detail.kinds.judgement}
      title={name}
      data={{ source: node.source, level: level === null ? undefined : one(level), changed: node.changed || undefined }}
      className={cn(node.source === "refused" && "border-dashed")}
      trigger={
        <>
          <span aria-hidden="true" data-slot="swatch" className={cn("w-2 shrink-0", level === null && node.source !== "empty" && "border-r border-dashed")} style={swatch} />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5 px-2.5 py-2">
            <span className="text-sm leading-snug">{name}</span>
            <span className="font-mono text-xs tracking-[0.04em] text-text-secondary uppercase">{status}</span>
            {node.changed && <span className="font-mono text-xs tracking-[0.04em] text-hot uppercase">{text.node.changed}</span>}
          </span>
          {node.probabilities && (
            <span className="flex items-end py-2 pr-2">
              <MiniHistogram probabilities={node.probabilities} />
            </span>
          )}
        </>
      }
    >
      <DetailList
        rows={[
          [text.detail.step, turnName(labels, node.turn)],
          [text.detail.dimension, dimensionName(labels, node.dimension)],
          [text.detail.source, labels.fieldSources[node.source]],
          [text.detail.expected, level === null ? null : interpolate(text.detail.expectedValue, { level: one(level), name: levelName(labels, level) })],
          [text.detail.confidence, certainty],
          [
            text.detail.spread,
            node.probabilities ? interpolate(text.detail.spreadValue, { value: one(Math.sqrt(levelVariance(node.probabilities))) }) : null,
          ],
        ]}
      />
      {node.probabilities && (
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">{text.detail.histogram}</p>
          <LevelHistogram probabilities={node.probabilities} label={text.detail.histogram} />
          <p className="text-xs text-muted-foreground">{text.detail.confidenceHelp}</p>
        </div>
      )}
      {node.source === "empty" && <p>{text.detail.emptyNote}</p>}
      {node.source === "refused" && <p>{text.detail.refusedNote}</p>}
      {node.changed && <p>{text.detail.changedNote}</p>}
    </FlowNodeButton>
  )
}
