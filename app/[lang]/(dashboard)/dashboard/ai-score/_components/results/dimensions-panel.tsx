"use client"

import { useState } from "react"

import type { AiScore } from "@/lib/project"
import { useDictionary } from "../../../_components/i18n-provider"
import { DimensionBars } from "./dimension-bars"
import { DimensionLegend } from "./dimension-legend"
import { DimensionTable } from "./dimension-table"
import { ResultsSection } from "./results-section"
import { ViewSwitch, type ResultView } from "./view-switch"

/** The seven dimensions (D-75): bars with caps, ghosts and whiskers, or the same numbers as a table. */
export function DimensionsPanel({ score }: { score: AiScore }) {
  const copy = useDictionary("ai-score").results.dimensions
  const [view, setView] = useState<ResultView>("chart")

  return (
    <ResultsSection title={copy.title} lead={copy.lead} actions={<ViewSwitch value={view} onChange={setView} />} data-slot="dimensions-panel" data-view={view}>
      {view === "chart" ? (
        <div className="flex flex-col gap-3">
          <DimensionLegend />
          <DimensionBars dimensions={score.dimensions} />
        </div>
      ) : (
        <DimensionTable score={score} />
      )}
    </ResultsSection>
  )
}
