"use client"

import { useId } from "react"

import type { AiScore, Project } from "@/lib/project"
import { useDictionary } from "../../../_components/i18n-provider"
import type { ResultActions } from "../types"
import { ChecksPanel } from "./checks-panel"
import { DeleteScore } from "./delete-score"
import { DimensionsPanel } from "./dimensions-panel"
import { HowWeScore } from "./how-we-score"
import { JudgementsPanel } from "./judgements-panel"
import { OutdatedBanner } from "./outdated-banner"
import { ReportPanel } from "./report-panel"
import { ScoreSummary } from "./score-summary"
import { SourcesPanel } from "./sources-panel"
import { SuggestionsPanel } from "./suggestions-panel"
import { useLastRequest } from "./use-last-request"

export interface ScoreResultsProps {
  project: Project
  score: AiScore
  /** Ids of the judgements whose fields changed since the run (`aiScoreStatus`). */
  changed: readonly string[]
  actions: ResultActions
}

/**
 * The saved AI Plan Score in full (PLAN-AI-SCORE-00 step 6): the outdated notice, the score with
 * its band and label, the short report, the seven dimensions, every plan part, the checks and
 * decisions, suggestions on demand (D-77), "How we score" (D-33) and the sources. Each part that is
 * AI output carries `data-ai-generated` (D-73); the method and the sources are the app's own copy.
 * The page owns the requests; these views only call `actions`.
 */
export function ScoreResults({ score, changed, actions }: ScoreResultsProps) {
  const copy = useDictionary("ai-score").results
  const titleId = useId()
  const last = useLastRequest(actions.busy)

  return (
    <section aria-labelledby={titleId} data-slot="ai-score-results" data-score={score.score} className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex max-w-[72ch] min-w-0 flex-col gap-1.5">
          <h2 id={titleId} className="text-2xl leading-tight font-[560] tracking-[-0.04em] [font-stretch:84%]">
            {copy.title}
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">{copy.lead}</p>
        </div>
        <DeleteScore onDelete={actions.remove} disabled={actions.busy !== null} />
      </header>
      <OutdatedBanner score={score} changed={changed} />
      <ScoreSummary score={score} />
      <ReportPanel report={score.report} actions={actions} error={last === "report" ? actions.error : null} />
      <DimensionsPanel score={score} />
      <JudgementsPanel score={score} changed={changed} actions={actions} />
      <ChecksPanel score={score} actions={actions} />
      <SuggestionsPanel score={score} actions={actions} error={last === "suggestions" ? actions.error : null} />
      <HowWeScore />
      <SourcesPanel />
    </section>
  )
}
