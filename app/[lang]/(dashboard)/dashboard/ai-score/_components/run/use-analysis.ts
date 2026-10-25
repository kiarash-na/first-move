"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { TextLang } from "@/lib/ai/plan-score/text-input"
import { KEYS } from "@/lib/assistant/keys/registry"
import type { ScoreClient } from "@/lib/assistant/plan-score/client"
import { runAnalysis } from "@/lib/assistant/plan-score/run-analysis"
import { assistantErrorCode, type AssistantErrorCode } from "@/lib/assistant/providers/errors"
import type { Provider } from "@/lib/assistant/providers/types"
import type { Project } from "@/lib/project"
import type { ProjectStore } from "@/lib/store"
import { applyEvent, finishProgress, startProgress, stopProgress, type RunProgress } from "./progress"

export interface AnalysisRun {
  phase: "idle" | "running" | "done" | "failed"
  progress: RunProgress | null
  /** Why the run stopped (a provider error, or `aborted`). */
  error: AssistantErrorCode | null
  /** The score was kept, but the report failed. */
  reportError: AssistantErrorCode | null
  /** Whether the store took the score (false when the project was closed meanwhile). */
  saved: boolean | null
}

const IDLE: AnalysisRun = { phase: "idle", progress: null, error: null, reportError: null, saved: null }

/** Builds the score client of a provider for the user's key; injectable for tests. */
export type ScoreClientFactory = (provider: Provider, key: string) => ScoreClient

/**
 * One AI Plan Score run from the page (PLAN-AI-SCORE-00 step 6): reads the chosen provider's key
 * from memory at the start only, follows the turns live, saves the score with `setAiScore` even
 * when the plan changed meanwhile (its hashes mark those fields outdated) and maps errors to copy
 * codes. A cancel, a new run or leaving the page aborts the requests, at any step, and then
 * nothing is saved.
 */
export function useAnalysis(store: ProjectStore, createClient: ScoreClientFactory, provider: Provider) {
  const [run, setRun] = useState<AnalysisRun>(IDLE)
  const controller = useRef<AbortController | null>(null)

  useEffect(() => () => controller.current?.abort(), [])

  const start = useCallback(
    async (project: Project, textModelId: string, lang: TextLang) => {
      const key = KEYS[provider].read()
      if (!key) return
      controller.current?.abort()
      const abort = new AbortController()
      controller.current = abort
      const current = () => controller.current === abort
      setRun({ phase: "running", progress: startProgress(), error: null, reportError: null, saved: null })
      try {
        const result = await runAnalysis(project, {
          client: createClient(provider, key),
          textModelId,
          lang,
          abortSignal: abort.signal,
          onEvent: (event) => {
            if (current()) setRun((previous) => (previous.progress ? { ...previous, progress: applyEvent(previous.progress, event) } : previous))
          },
        })
        if (!current()) return
        // A cancel while the report is written ends the run too: the score is not saved.
        if (abort.signal.aborted) {
          setRun((previous) => ({ ...previous, phase: "failed", progress: previous.progress && stopProgress(previous.progress), error: "aborted" }))
          return
        }
        const saved = store.setAiScore(project.meta.id, result.score)
        setRun((previous) => ({
          phase: "done",
          progress: previous.progress && finishProgress(previous.progress, result.reportError !== null),
          error: null,
          reportError: result.reportError,
          saved,
        }))
      } catch (error) {
        if (!current()) return
        const code = abort.signal.aborted ? "aborted" : assistantErrorCode(error)
        setRun((previous) => ({ ...previous, phase: "failed", progress: previous.progress && stopProgress(previous.progress), error: code }))
      } finally {
        if (current()) controller.current = null
      }
    },
    [store, createClient, provider],
  )

  const cancel = useCallback(() => controller.current?.abort(), [])

  /** Forgets the outcome of the last run (e.g. after the saved score was removed). */
  const reset = useCallback(() => setRun(IDLE), [])

  return { run, start, cancel, reset }
}
