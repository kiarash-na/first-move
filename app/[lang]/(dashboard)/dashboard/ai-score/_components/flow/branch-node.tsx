"use client"

import { CheckIcon, SplitIcon } from "lucide-react"

import { BRANCHES } from "@/lib/ai/plan-score/branches"
import { formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { DetailList } from "./detail-list"
import { branchName, branchQuestion, gateName, optionName, turnName } from "./flow-labels"
import { nodeKey, type BranchView } from "./flow-model"
import { FlowNodeButton } from "./flow-node-button"
import { branchText } from "./node-text"

/**
 * A branch: the option Jev picked steers which follow-up check the next turn asks. The node shows
 * the choice and how sure Jev was; its detail lists every option with its probability and the
 * follow-up it opened. The edge to that follow-up is drawn by the graph.
 */
export function BranchNode({ node }: { node: BranchView }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const { labels } = copy
  const text = copy.flow
  const name = branchName(labels, node.id)
  const refused = node.choice === "refused"
  const { result: chosen, certainty: sure } = branchText(node, copy, lang)
  const options = BRANCHES.find((branch) => branch.id === node.id)?.options ?? []

  return (
    <FlowNodeButton
      nodeKey={nodeKey("branch", node.id)}
      kind={text.detail.kinds.branch}
      title={name}
      data={{ choice: node.choice, "follow-up": node.followUp ?? undefined }}
      className={cn(refused && "border-dashed")}
      trigger={
        <span className="flex min-w-0 flex-1 items-start gap-2.5 px-2.5 py-2">
          <SplitIcon className="mt-0.5 size-4 shrink-0 rotate-90 text-hot" strokeWidth={1.8} aria-hidden="true" />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm leading-snug">{name}</span>
            <span className="text-sm leading-snug font-[560]">{chosen}</span>
            {sure !== null && <span className="font-mono text-xs tracking-[0.04em] text-text-secondary uppercase">{interpolate(text.node.chosen, { value: sure })}</span>}
          </span>
        </span>
      }
    >
      {branchQuestion(labels, node.id) && <p className="text-text-secondary">{branchQuestion(labels, node.id)}</p>}
      <div className="flex flex-col gap-1.5">
        <p className="font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">{text.detail.options}</p>
        <ul className="flex flex-col gap-1">
          {options.map((option) => {
            const isChosen = option.id === node.choice
            return (
              <li key={option.id} data-chosen={isChosen || undefined} className={cn("flex items-center justify-between gap-3", isChosen && "font-[560]")}>
                <span className="inline-flex items-center gap-1.5">
                  {isChosen ? <CheckIcon className="size-3.5 text-hot" strokeWidth={2} aria-label={text.detail.chosen} /> : <span className="size-3.5" aria-hidden="true" />}
                  {optionName(labels, node.id, option.id)}
                </span>
                <span className="font-mono text-xs tabular-nums">{formatPercent(node.probabilities[option.id] ?? 0, lang)}</span>
              </li>
            )
          })}
        </ul>
      </div>
      <DetailList
        rows={[
          [text.detail.step, turnName(labels, node.turn)],
          [text.detail.followUp, node.followUp ? gateName(labels, node.followUp) : text.detail.none],
        ]}
      />
      {refused && <p>{text.detail.refusedNote}</p>}
    </FlowNodeButton>
  )
}
