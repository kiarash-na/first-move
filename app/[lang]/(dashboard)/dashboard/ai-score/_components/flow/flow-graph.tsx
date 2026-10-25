"use client"

import { JUDGEMENTS } from "@/lib/ai/plan-score/judgements"
import type { RunTurn } from "@/lib/ai/plan-score/run"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { AiReport } from "@/lib/project"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import type { StepState } from "../run/progress"
import type { AggregateView } from "./aggregate-view"
import { BranchNode } from "./branch-node"
import { DimensionNode } from "./dimension-node"
import { FlowColumn } from "./flow-column"
import { FlowEdges } from "./flow-edges"
import { FlowGroup } from "./flow-group"
import { turnName } from "./flow-labels"
import { graphNodes, type FlowGraph as Graph } from "./flow-model"
import { GateNode } from "./gate-node"
import { JudgementNode } from "./judgement-node"
import { LEVEL_RAMP_CLASS } from "./level-ramp"
import { ReportNode } from "./report-node"
import { ScoreNode } from "./score-node"
import { SignalNode } from "./signal-node"

export interface FlowStates {
  turns: Record<RunTurn, { state: StepState; questions: number | null }>
  aggregate: StepState
  report: StepState | "none"
}

/**
 * The decision flow from left to right (PLAN-AI-SCORE-00 step 6): turn 0 without AI, the four
 * Jev turns with their plan parts, checks and branches, the aggregation without AI and the report.
 * Seven columns on a wide graph, five plus two on a medium one, stacked on a narrow one (container
 * queries, so no horizontal page scroll); the edges follow the layout.
 */
export function FlowGraph({ graph, states, aggregate, report }: { graph: Graph; states: FlowStates; aggregate: AggregateView | null; report: AiReport | null }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const { labels } = copy
  const text = copy.flow
  const turnLabel = (turn: RunTurn) => interpolate(text.columns.turn, { turn })
  const filled = JUDGEMENTS.length - graph.empty.length
  const layoutKey = `${graphNodes(graph).length}|${Object.values(states.turns)
    .map((entry) => entry.state)
    .join()}|${states.aggregate}|${states.report}`

  return (
    <div data-slot="flow-graph" className={cn("@container", LEVEL_RAMP_CLASS)}>
      <div className="relative">
        <ol aria-label={text.title} className="grid grid-cols-1 gap-6 pl-4 @4xl:grid-cols-5 @4xl:gap-x-4 @4xl:pl-0 @7xl:grid-cols-[minmax(0,0.9fr)_repeat(4,minmax(0,1fr))_minmax(0,1.1fr)_minmax(0,0.85fr)]">
          <FlowColumn
            id="0"
            eyebrow={turnLabel(0)}
            title={text.columns.read}
            note={text.columns.noAi}
            state={states.turns[0].state}
            hasNodes={graph.signal !== undefined}
          >
            {graph.signal !== undefined && (
              <>
                <SignalNode signal={graph.signal} />
                <p className="font-mono text-xs tracking-[0.04em] text-text-secondary uppercase">
                  {interpolate(text.node.filled, { filled: formatNumber(filled, lang), total: formatNumber(JUDGEMENTS.length, lang) })}
                </p>
                <FlowGroup label={text.groups.empty} items={graph.empty.map((node) => ({ key: node.id, node: <JudgementNode node={node} /> }))} />
              </>
            )}
          </FlowColumn>
          {graph.turns.map(({ turn, judgements, gates, branches }) => (
            <FlowColumn
              key={turn}
              id={String(turn)}
              eyebrow={turnLabel(turn)}
              title={turnName(labels, turn)}
              note={text.columns.jev}
              state={states.turns[turn].state}
              questions={states.turns[turn].questions}
              hasNodes={judgements.length + gates.length + branches.length > 0}
            >
              <FlowGroup label={text.groups.judgements} items={judgements.map((node) => ({ key: node.id, node: <JudgementNode node={node} /> }))} />
              <FlowGroup
                label={text.groups.gates}
                items={gates.map((node) => ({
                  key: node.id,
                  node: <GateNode node={node} opener={node.branch ? graph.turns.flatMap((entry) => entry.branches).find((branch) => branch.followUp === node.id) : null} />,
                }))}
              />
              <FlowGroup label={text.groups.branches} items={branches.map((node) => ({ key: node.id, node: <BranchNode node={node} /> }))} />
            </FlowColumn>
          ))}
          <FlowColumn
            id="aggregate"
            eyebrow={text.columns.aggregate}
            title={text.columns.aggregateTitle}
            note={text.columns.noAi}
            state={aggregate ? "done" : states.aggregate}
            hasNodes={aggregate !== null}
            className="@4xl:col-span-3 @7xl:col-span-1"
          >
            {aggregate && (
              <>
                <FlowGroup label={text.groups.dimensions} items={aggregate.dimensions.map((dimension) => ({ key: dimension.id, node: <DimensionNode dimension={dimension} /> }))} />
                <ScoreNode result={aggregate} />
              </>
            )}
          </FlowColumn>
          <FlowColumn
            id="report"
            eyebrow={text.columns.report}
            title={text.columns.reportTitle}
            note={text.columns.textModel}
            state={report ? "done" : states.report === "running" || states.report === "pending" || states.report === "skipped" ? states.report : "done"}
            ghosts={false}
            runningText={null}
            hasNodes
            className="@4xl:col-span-2 @7xl:col-span-1"
          >
            {(report || (states.report !== "pending" && states.report !== "skipped")) && <ReportNode state={states.report} report={report} />}
          </FlowColumn>
        </ol>
        <FlowEdges edges={graph.edges} layoutKey={layoutKey} />
      </div>
    </div>
  )
}
