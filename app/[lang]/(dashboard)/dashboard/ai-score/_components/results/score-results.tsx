"use client"

import type { AiScore, Project } from "@/lib/project"
import type { ResultActions } from "../types"

export interface ScoreResultsProps {
  project: Project
  score: AiScore
  /** Ids of the judgements whose fields changed since the run (`aiScoreStatus`). */
  changed: readonly string[]
  actions: ResultActions
}

/** The saved AI Plan Score in full (PLAN-AI-SCORE-00 step 6). */
export function ScoreResults({ score }: ScoreResultsProps) {
  return <section data-slot="ai-score-results" data-score={score.score} />
}
