import { vi } from "vitest"

import { DECISION_PROVIDER_OPTIONS } from "@/lib/ai/plan-score/decide-turn"
import { mockJev, type MockJevAnswers } from "@/lib/ai/plan-score/test-utils/mock-jev"
import { mockText } from "@/lib/ai/plan-score/test-utils/mock-text"
import type { ScoreClient } from "@/lib/assistant/plan-score/client"
import type { Provider } from "@/lib/assistant/providers/types"

/** Tests only: what the mock text model answers for a report. */
export const REPORT = {
  headline: "A specific plan with open financing.",
  summary: "The plan names its buildings and owners; financing and the decision gate stay open.",
  strengths: [{ text: "Clear site description.", keys: ["site"] }],
  gaps: [{ text: "No lender named.", keys: ["financing"] }],
  actions: ["Ask a bank for an indication."],
}

export interface FakeClientOptions {
  jev?: MockJevAnswers
  /** A text answer, or a status code the text model fails with. */
  text?: unknown
  textStatus?: number
  /** Holds every Jev call until `release()`, to see a run in flight. */
  hold?: boolean
  /** Holds every text call until `releaseText()`, to see a report or a suggestion in flight. */
  holdText?: boolean
}

const failure = (status: number) => Object.assign(new Error(`status ${status}`), { statusCode: status })

/** Waits for `gate`, or fails like a real request when `signal` aborts first. */
function held(gate: Promise<void>, signal: AbortSignal | undefined) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason)
    signal?.addEventListener("abort", () => reject(signal.reason), { once: true })
    void gate.then(resolve)
  })
}

/**
 * Tests only: a score client whose models are the engine's mocks (no network). `create` is what
 * the page calls with provider and key; it records the pairs it was given.
 */
export function fakeClient(options: FakeClientOptions = {}) {
  const jev = mockJev({ branches: { "anchor-type": "residential", "source-type": "groundwater", ownership: "community" }, ...options.jev })
  let open: () => void = () => {}
  let gate: Promise<void> = Promise.resolve()
  if (options.hold) gate = new Promise<void>((resolve) => (open = resolve))
  const doDecide = jev.model.doDecide.bind(jev.model)
  jev.model.doDecide = async (call) => {
    await held(gate, call.abortSignal)
    return doDecide(call)
  }
  let openText: () => void = () => {}
  let textGate: Promise<void> = Promise.resolve()
  if (options.holdText) textGate = new Promise<void>((resolve) => (openText = resolve))
  const textModel = vi.fn((id: string) => {
    void id
    if (options.textStatus) throw failure(options.textStatus)
    const model = mockText(options.text ?? REPORT)
    const doGenerate = model.doGenerate.bind(model)
    model.doGenerate = async (call) => {
      await held(textGate, call.abortSignal)
      return doGenerate(call)
    }
    return model
  })
  const client: ScoreClient = { decisionModel: () => jev.model, decisionProviderOptions: DECISION_PROVIDER_OPTIONS, textModel, textProviderOptions: () => ({}) }
  const create = vi.fn((provider: Provider, key: string) => {
    void provider
    void key
    return client
  })
  return { client, create, jev, textModel, release: () => open(), releaseText: () => openText() }
}
