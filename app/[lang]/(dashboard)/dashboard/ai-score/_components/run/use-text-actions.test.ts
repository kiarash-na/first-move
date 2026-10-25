import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { clearGatewayKey, setGatewayKey } from "@/lib/assistant/gateway/key"
import type { AiScore } from "@/lib/project"
import { fakeClient, REPORT } from "../test-utils/fake-client"
import { aiScoreStore } from "../test-utils/render"
import { example, scored } from "../test-utils/scored"
import { useTextActions } from "./use-text-actions"

const KEY = "vck_test_0123456789abcdefWXYZ"
let score: AiScore

beforeAll(async () => {
  score = await scored(example(), { levels: { financing: [1, 0, 0, 0, 0] } })
})
afterEach(() => clearGatewayKey())

function setup(options: Parameters<typeof fakeClient>[0] = {}, ready = true, running = false) {
  const project = { ...example(), aiScore: score }
  const store = aiScoreStore(project)
  const fake = fakeClient(options)
  const onRemove = vi.fn()
  const hook = renderHook(() =>
    useTextActions({ store: store.store, createClient: fake.create, project, score, textModelId: "example/text-model", lang: "en", ready, running, onRemove }),
  )
  return { store, fake, hook, onRemove }
}

describe("useTextActions (ResultActions)", () => {
  it("writes the report again with the chosen model and saves it", async () => {
    setGatewayKey(KEY)
    const { store, fake, hook } = setup()
    expect(hook.result.current.canUseAi).toBe(true)
    await act(async () => hook.result.current.rewriteReport())
    await vi.waitFor(() => expect(store.setAiScore).toHaveBeenCalled())
    expect(fake.textModel).toHaveBeenCalledWith("example/text-model")
    expect(store.setAiScore.mock.calls[0][1]?.report?.headline).toBe(REPORT.headline)
    expect(hook.result.current.busy).toBeNull()
  })

  it("asks for suggestions on demand and saves them", async () => {
    setGatewayKey(KEY)
    const { store, hook } = setup({ text: { items: [{ key: "financing", suggestions: ["Ask a bank for an indication."] }] } })
    await act(async () => hook.result.current.suggest(["financing"]))
    await vi.waitFor(() => expect(store.setAiScore).toHaveBeenCalled())
    expect(store.setAiScore.mock.calls[0][1]?.suggestions?.items).toEqual([{ key: "financing", texts: ["Ask a bank for an indication."] }])
  })

  it("reports a Gateway error as a code and keeps the saved score", async () => {
    setGatewayKey(KEY)
    const { store, hook } = setup({ textStatus: 429 })
    await act(async () => hook.result.current.rewriteReport())
    await vi.waitFor(() => expect(hook.result.current.error).toBe("rate"))
    expect(store.setAiScore).not.toHaveBeenCalled()
  })

  it("drops a result when a newer run replaced the score meanwhile", async () => {
    setGatewayKey(KEY)
    const { store, fake, hook } = setup({ holdText: true })
    await act(async () => hook.result.current.rewriteReport())
    expect(hook.result.current.busy).toBe("report")
    const newer: AiScore = { ...score, at: "2026-10-25T12:00:00.000Z", score: 12.3, report: null }
    act(() => {
      store.store.setAiScore(store.current().meta.id, newer)
    })
    fake.releaseText()
    await vi.waitFor(() => expect(hook.result.current.busy).toBeNull())
    expect(store.setAiScore).toHaveBeenCalledTimes(1)
    expect(store.current().aiScore).toBe(newer)
    expect(hook.result.current.error).toBeNull()
  })

  it("starts no text request while a run is in flight", () => {
    setGatewayKey(KEY)
    const { fake, hook } = setup({}, true, true)
    expect(hook.result.current.canUseAi).toBe(false)
    act(() => hook.result.current.rewriteReport())
    act(() => hook.result.current.suggest())
    expect(fake.create).not.toHaveBeenCalled()
    expect(hook.result.current.busy).toBeNull()
  })

  it("forgets the last error on request", async () => {
    setGatewayKey(KEY)
    const { hook } = setup({ textStatus: 429 })
    await act(async () => hook.result.current.rewriteReport())
    await vi.waitFor(() => expect(hook.result.current.error).toBe("rate"))
    act(() => hook.result.current.clearError())
    expect(hook.result.current.error).toBeNull()
  })

  it("does nothing while not ready, and removes the saved score", () => {
    setGatewayKey(KEY)
    const { store, fake, hook, onRemove } = setup({}, false)
    expect(hook.result.current.canUseAi).toBe(false)
    act(() => hook.result.current.rewriteReport())
    expect(fake.create).not.toHaveBeenCalled()
    act(() => hook.result.current.remove())
    expect(store.setAiScore).toHaveBeenCalledWith(store.current().meta.id, null)
    expect(store.current().aiScore).toBeNull()
    expect(onRemove).toHaveBeenCalled()
  })
})
