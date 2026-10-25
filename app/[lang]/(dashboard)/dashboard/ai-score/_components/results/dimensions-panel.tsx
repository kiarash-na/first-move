"use client"

import { useState } from "react"

import { DIMENSIONS } from "@/lib/ai/plan-score/dimensions"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { AiScore } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { DimensionBars } from "./dimension-bars"
import { DimensionLegend } from "./dimension-legend"
import { DimensionTable } from "./dimension-table"
import { ResultsSection } from "./results-section"
import { ViewSwitch, type ResultView } from "./view-switch"

/** The seven dimensions (D-75): bars with caps, ghosts and whiskers, or the same numbers as a table. */
export function DimensionsPanel({ score }: { score: AiScore }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score").results.dimensions
  const [view, setView] = useState<ResultView>("chart")

  return (
    <ResultsSection
      title={interpolate(copy.title, { count: formatNumber(DIMENSIONS.length, lang) })}
      lead={copy.lead}
      actions={<ViewSwitch value={view} onChange={setView} />}
      data-slot="dimensions-panel"
      data-view={view}
      data-ai-generated="true"
    >
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
