"use client"

import type { ModelMessage } from "ai"
import { useCallback, useMemo, useRef, useState } from "react"

import type { Texts } from "@/lib/ai/extract/field-label"
import type { Proposal } from "@/lib/ai/extract/propose"
import { searchDocs } from "@/lib/ai/knowledge/load"
import { aiProvenance } from "@/lib/ai/provenance/mark"
import { assistantInstructions } from "@/lib/assistant/agent/instructions"
import { runTurn } from "@/lib/assistant/agent/run-turn"
import { assistantTools } from "@/lib/assistant/agent/tools"
import { KEYS } from "@/lib/assistant/keys/registry"
import { touchIdleLock } from "@/lib/assistant/keys/unlock"
import { assistantErrorCode, type AssistantErrorCode } from "@/lib/assistant/providers/errors"
import { assistantModel, assistantProviderOptions } from "@/lib/assistant/providers/model"
import type { Provider } from "@/lib/assistant/providers/types"
import { useDictionary, useLocale } from "../../_components/i18n-provider"
import { useStore } from "../../_components/store-provider"

export interface ChatItem {
  id: string
  role: "user" | "assistant"
  text: string
  /** Tools the assistant used for this answer, in order. */
  tools: string[]
  /** Review cards of this answer (tool call ids). */
  proposals: string[]
  error: AssistantErrorCode | null
  done: boolean
}

export interface ProposalItem {
  proposal: Proposal
  state: "open" | "applied" | "dismissed" | "no-project"
  applied: number
}

let ids = 0
const nextId = () => `m${++ids}`

/**
 * The conversation with the assistant for the open project (memory only: no chat history is
 * stored, O7 "minimal"). Each message runs one turn in the browser with the user's key; tools read
 * a fresh project snapshot; proposals wait for the user in review cards and are applied only
 * through `store.applyProposal`, with AI provenance.
 */
export function useAssistantChat({ provider, modelId }: { provider: Provider; modelId: string }) {
  const store = useStore()
  const lang = useLocale()
  const shell = useDictionary("shell")
  const quickCheck = useDictionary("quick-check")
  const businessPlan = useDictionary("business-plan")
  const calc = useDictionary("calc")
  const texts = useMemo<Texts>(() => ({ shell, "quick-check": quickCheck, "business-plan": businessPlan, calc }), [shell, quickCheck, businessPlan, calc])
  const [items, setItems] = useState<ChatItem[]>([])
  const [proposals, setProposals] = useState<Record<string, ProposalItem>>({})
  const [busy, setBusy] = useState(false)
  const history = useRef<ModelMessage[]>([])
  const note = useRef<string | null>(null)
  const controller = useRef<AbortController | null>(null)

  const patchLast = useCallback((update: (item: ChatItem) => ChatItem) => {
    setItems((current) => current.map((item, index) => (index === current.length - 1 ? update(item) : item)))
  }, [])

  const send = useCallback(
    async (input: string) => {
      const text = input.trim()
      const key = KEYS[provider].read()
      if (!text || busy) return
      touchIdleLock()
      const assistantId = nextId()
      setItems((current) => [
        ...current,
        { id: nextId(), role: "user", text, tools: [], proposals: [], error: null, done: true },
        { id: assistantId, role: "assistant", text: "", tools: [], proposals: [], error: key ? null : "key", done: !key },
      ])
      if (!key) return
      const content = note.current ? `[${note.current}]\n\n${text}` : text
      const messages: ModelMessage[] = [...history.current, { role: "user", content }]
      const abort = new AbortController()
      controller.current = abort
      setBusy(true)
      try {
        const response = await runTurn({
          model: assistantModel(provider, key, modelId),
          providerOptions: assistantProviderOptions(provider, modelId),
          instructions: assistantInstructions(lang),
          messages,
          tools: assistantTools({
            lang,
            texts,
            project: () => store.getState().active,
            search: searchDocs,
            onProposal: (toolCallId, proposal) => {
              setProposals((current) => ({ ...current, [toolCallId]: { proposal, state: "open", applied: 0 } }))
              patchLast((item) => ({ ...item, proposals: [...item.proposals, toolCallId] }))
            },
          }),
          abortSignal: abort.signal,
          onEvent: (event) =>
            patchLast((item) => (event.type === "text" ? { ...item, text: item.text + event.delta } : { ...item, tools: [...item.tools, event.name] })),
        })
        history.current = [...messages, ...response]
        note.current = null
        patchLast((item) => ({ ...item, done: true }))
      } catch (error) {
        patchLast((item) => ({ ...item, error: assistantErrorCode(error), done: true }))
      } finally {
        controller.current = null
        setBusy(false)
      }
    },
    [busy, provider, modelId, lang, texts, store, patchLast],
  )

  const stop = useCallback(() => controller.current?.abort(), [])

  /** Sends the last question again after an error. */
  const retry = useCallback(() => {
    const last = [...items].reverse().find((item) => item.role === "user")
    if (!last || busy) return
    setItems((current) => current.slice(0, current.lastIndexOf(last)))
    void send(last.text)
  }, [items, busy, send])

  /** Applies the selected entries of a proposal through the store (D-60 provenance). */
  const apply = useCallback(
    (id: string, keys: readonly string[]) => {
      const item = proposals[id]
      if (!item || item.state !== "open") return
      const patch = Object.fromEntries(item.proposal.valid.filter((entry) => keys.includes(entry.key)).map((entry) => [entry.key, entry.value]))
      const result = store.applyProposal(patch, aiProvenance("assistant", modelId))
      if (!result) {
        setProposals((current) => ({ ...current, [id]: { ...item, state: "no-project" } }))
        return
      }
      note.current = result.applied.length
        ? `Review card: the user applied ${result.applied.join(", ")}.`
        : "Review card: nothing could be applied."
      setProposals((current) => ({ ...current, [id]: { ...item, state: "applied", applied: result.applied.length } }))
    },
    [proposals, store, modelId],
  )

  const dismiss = useCallback((id: string) => {
    note.current = "Review card: the user dismissed the proposal."
    setProposals((current) => (current[id] ? { ...current, [id]: { ...current[id], state: "dismissed" } } : current))
  }, [])

  const clear = useCallback(() => {
    controller.current?.abort()
    history.current = []
    note.current = null
    setItems([])
    setProposals({})
  }, [])

  return { items, proposals, busy, send, stop, retry, apply, dismiss, clear }
}
