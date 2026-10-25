"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { TextLang } from "@/lib/ai/plan-score/text-input"
import { KEYS } from "@/lib/assistant/keys/registry"
import { rewriteReport, suggest } from "@/lib/assistant/plan-score/run-analysis"
import { assistantErrorCode, type AssistantErrorCode } from "@/lib/assistant/providers/errors"
import type { Provider } from "@/lib/assistant/providers/types"
import type { AiScore, Project } from "@/lib/project"
import type { ProjectStore } from "@/lib/store"
import type { ResultActions } from "../types"
import type { ScoreClientFactory } from "./use-analysis"

export interface TextActionsInput {
  store: ProjectStore
  createClient: ScoreClientFactory
  /** The provider whose key and models the text requests use. */
  provider: Provider
  /** The open project; null while none is open (nothing runs then). */
  project: Project | null
  score: AiScore | null
  textModelId: string
  lang: TextLang
  /** A key is set, what is sent is confirmed and the text model id is valid. */
  ready: boolean
  /** A run is in flight: its score replaces the saved one, so no text request starts meanwhile. */
  running?: boolean
  /** Called after the saved score was removed. */
  onRemove?: () => void
}

/** `ResultActions` plus what only the page needs. */
export interface TextActions extends ResultActions {
  /** Forgets the error of the last text request, e.g. when a new run starts. */
  clearError: () => void
}

/**
 * What the saved result may ask of the page (`ResultActions`): write the report again and
 * on-demand suggestions (D-77) with the chosen text model, each saved with `setAiScore`, and
 * remove. One text request at a time, none during a run; leaving the page aborts it. A result is
 * saved only onto the score it was asked for: when a newer run replaced that score meanwhile,
 * it is dropped.
 */
export function useTextActions({ store, createClient, provider, project, score, textModelId, lang, ready, running = false, onRemove }: TextActionsInput): TextActions {
  const [busy, setBusy] = useState<ResultActions["busy"]>(null)
  const [error, setError] = useState<AssistantErrorCode | null>(null)
  const controller = useRef<AbortController | null>(null)
  const projectId = project?.meta.id ?? null

  useEffect(() => () => controller.current?.abort(), [])

  const request = useCallback(
    async (kind: "report" | "suggestions", at: string, write: (client: ReturnType<ScoreClientFactory>, signal: AbortSignal) => Promise<AiScore>) => {
      const key = KEYS[provider].read()
      if (!key || !ready || running || !projectId || controller.current) return
      const abort = new AbortController()
      controller.current = abort
      setBusy(kind)
      setError(null)
      try {
        const next = await write(createClient(provider, key), abort.signal)
        if (store.getState().active?.aiScore?.at === at) store.setAiScore(projectId, next)
      } catch (caught) {
        setError(abort.signal.aborted ? "aborted" : assistantErrorCode(caught))
      } finally {
        controller.current = null
        setBusy(null)
      }
    },
    [store, createClient, provider, projectId, ready, running],
  )

  const rewrite = useCallback(() => {
    if (!score || !project) return
    void request("report", score.at, (client, abortSignal) => rewriteReport(project, score, { client, textModelId, lang, abortSignal }))
  }, [request, project, score, textModelId, lang])

  const suggestFor = useCallback(
    (keys?: readonly string[]) => {
      if (!score || !project) return
      void request("suggestions", score.at, (client, abortSignal) => suggest(project, score, { client, textModelId, lang, abortSignal, keys }))
    },
    [request, project, score, textModelId, lang],
  )

  const remove = useCallback(() => {
    controller.current?.abort()
    if (projectId && store.setAiScore(projectId, null)) onRemove?.()
  }, [store, projectId, onRemove])

  const clearError = useCallback(() => setError(null), [])

  return { canUseAi: ready && score !== null && !running, running, busy, error, rewriteReport: rewrite, suggest: suggestFor, remove, clearError }
}
