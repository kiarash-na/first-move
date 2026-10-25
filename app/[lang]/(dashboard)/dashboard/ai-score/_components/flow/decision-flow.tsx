"use client"

import { useMemo, useState } from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useDictionary } from "../../../_components/i18n-provider"
import { Panel } from "../panel"
import { FlowGraph } from "./flow-graph"
import { FlowHow } from "./flow-how"
import { FlowLegend } from "./flow-legend"
import { flowView, type FlowSource } from "./flow-source"
import { FlowTable } from "./flow-table"

type View = "graph" | "table"

/**
 * The centrepiece (PLAN-AI-SCORE-00 step 6): every decision of the AI Plan Score as a flow, live
 * during a run and rebuilt from the saved score afterwards, with a legend, a table twin (dataviz:
 * every chart has one) and "How the flow decides" (D-33).
 */
export function DecisionFlow({ source }: { source: FlowSource }) {
  const copy = useDictionary("ai-score").flow
  const [view, setView] = useState<View>("graph")
  const shown = useMemo(() => flowView(source), [source])

  return (
    <Panel
      id="ai-score-flow"
      eyebrow="03"
      title={copy.title}
      lead={copy.lead}
      actions={
        <ToggleGroup type="single" variant="outline" value={view} onValueChange={(next) => next && setView(next as View)} aria-label={copy.view.label} className="shrink-0">
          <ToggleGroupItem value="graph" className="min-h-11 min-w-11">
            {copy.view.graph}
          </ToggleGroupItem>
          <ToggleGroupItem value="table" className="min-h-11 min-w-11">
            {copy.view.table}
          </ToggleGroupItem>
        </ToggleGroup>
      }
    >
      <div data-slot="decision-flow" data-mode={source.mode} data-view={view} className="flex min-w-0 flex-col gap-6">
        {source.mode === "idle" && <p className="text-base text-text-secondary">{copy.placeholder}</p>}
        <FlowLegend />
        {view === "graph" ? <FlowGraph {...shown} /> : <FlowTable graph={shown.graph} aggregate={shown.aggregate} report={shown.report} />}
        <FlowHow />
      </div>
    </Panel>
  )
}
