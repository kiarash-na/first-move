import { vi } from "vitest"

import { mockJev, type MockJevAnswers } from "@/lib/ai/plan-score/test-utils/mock-jev"
import { mockText } from "@/lib/ai/plan-score/test-utils/mock-text"
import type { GatewayClient } from "@/lib/assistant/gateway/client"

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
  /** The balance, or a status code the credits check fails with. */
  balance?: string
  creditsStatus?: number
  /** Holds every Jev call until `release()`, to see a run in flight. */
  hold?: boolean
}

const failure = (status: number) => Object.assign(new Error(`status ${status}`), { statusCode: status })

/**
 * Tests only: a Gateway client whose models are the engine's mocks (no network). `create` is what
 * the page calls with the key; it records the keys it was given.
 */
export function fakeClient(options: FakeClientOptions = {}) {
  const jev = mockJev({ branches: { "anchor-type": "residential", "source-type": "groundwater", ownership: "community" }, ...options.jev })
  let open: () => void = () => {}
  let gate: Promise<void> = Promise.resolve()
  if (options.hold) gate = new Promise<void>((resolve) => (open = resolve))
  const doDecide = jev.model.doDecide.bind(jev.model)
  jev.model.doDecide = async (call) => {
    await new Promise<void>((resolve, reject) => {
      const signal = call.abortSignal
      if (signal?.aborted) return reject(signal.reason)
      signal?.addEventListener("abort", () => reject(signal.reason), { once: true })
      void gate.then(resolve)
    })
    return doDecide(call)
  }
  const credits = vi.fn(async () => {
    if (options.creditsStatus) throw failure(options.creditsStatus)
    return { balance: options.balance ?? "4.2", totalUsed: "0.8" }
  })
  const textModel = vi.fn((id: string) => {
    void id
    if (options.textStatus) throw failure(options.textStatus)
    return mockText(options.text ?? REPORT)
  })
  const client = { decisionModel: () => jev.model, textModel, credits } as unknown as GatewayClient
  const create = vi.fn((key: string) => {
    void key
    return client
  })
  return { client, create, jev, credits, textModel, release: () => open() }
}
