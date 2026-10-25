"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { TextLang } from "@/lib/ai/plan-score/text-input"
import type { GatewayClient } from "@/lib/assistant/gateway/client"
import { gatewayErrorCode, type GatewayErrorCode } from "@/lib/assistant/gateway/errors"
import { readGatewayKey } from "@/lib/assistant/gateway/key"
import { rewriteReport, suggest } from "@/lib/assistant/plan-score/run-analysis"
import type { AiScore, Project } from "@/lib/project"
import type { ProjectStore } from "@/lib/store"
import type { ResultActions } from "../types"

export interface TextActionsInput {
  store: ProjectStore
  createClient: (key: string) => GatewayClient
  /** The open project; null while none is open (nothing runs then). */
  project: Project | null
  score: AiScore | null
  textModelId: string
  lang: TextLang
  /** A key is set, what is sent is confirmed and the text model id is valid. */
  ready: boolean
  /** Called after the saved score was removed. */
  onRemove?: () => void
}

/**
 * What the saved result may ask of the page (`ResultActions`): write the report again and
 * on-demand suggestions (D-77) with the chosen text model, each saved with `setAiScore`, and
 * remove. One text request at a time; leaving the page aborts it.
 */
export function useTextActions({ store, createClient, project, score, textModelId, lang, ready, onRemove }: TextActionsInput): ResultActions {
  const [busy, setBusy] = useState<ResultActions["busy"]>(null)
  const [error, setError] = useState<GatewayErrorCode | null>(null)
  const controller = useRef<AbortController | null>(null)
  const projectId = project?.meta.id ?? null

  useEffect(() => () => controller.current?.abort(), [])

  const request = useCallback(
    async (kind: "report" | "suggestions", write: (client: GatewayClient, signal: AbortSignal) => Promise<AiScore>) => {
      const key = readGatewayKey()
      if (!key || !ready || !projectId || controller.current) return
      const abort = new AbortController()
      controller.current = abort
      setBusy(kind)
      setError(null)
      try {
        store.setAiScore(projectId, await write(createClient(key), abort.signal))
      } catch (caught) {
        setError(abort.signal.aborted ? "aborted" : gatewayErrorCode(caught))
      } finally {
        controller.current = null
        setBusy(null)
      }
    },
    [store, createClient, projectId, ready],
  )

  const rewrite = useCallback(() => {
    if (!score || !project) return
    void request("report", (client, abortSignal) => rewriteReport(project, score, { client, textModelId, lang, abortSignal }))
  }, [request, project, score, textModelId, lang])

  const suggestFor = useCallback(
    (keys?: readonly string[]) => {
      if (!score || !project) return
      void request("suggestions", (client, abortSignal) => suggest(project, score, { client, textModelId, lang, abortSignal, keys }))
    },
    [request, project, score, textModelId, lang],
  )

  const remove = useCallback(() => {
    controller.current?.abort()
    if (projectId && store.setAiScore(projectId, null)) onRemove?.()
  }, [store, projectId, onRemove])

  return { canUseAi: ready && score !== null, busy, error, rewriteReport: rewrite, suggest: suggestFor, remove }
}
