import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { aiScoreSchema } from "@/lib/project"
import { clearGatewayKey, setGatewayKey } from "@/lib/assistant/gateway/key"
import { fakeClient } from "../test-utils/fake-client"
import { aiScoreStore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { useAnalysis } from "./use-analysis"

const KEY = "vck_test_0123456789abcdefWXYZ"

afterEach(() => clearGatewayKey())

function setup(options: Parameters<typeof fakeClient>[0] = {}) {
  const project = example()
  const store = aiScoreStore(project)
  const fake = fakeClient(options)
  const hook = renderHook(() => useAnalysis(store.store, fake.create))
  return { project, store, fake, hook }
}

describe("useAnalysis", () => {
  it("does nothing without a key", async () => {
    const { project, fake, hook } = setup()
    await act(() => hook.result.current.start(project, "example/text-model", "en"))
    expect(fake.create).not.toHaveBeenCalled()
    expect(hook.result.current.run.phase).toBe("idle")
  })

  it("runs every turn, writes the report and saves a valid score", async () => {
    setGatewayKey(KEY)
    const { project, store, fake, hook } = setup()
    await act(() => hook.result.current.start(project, "example/text-model", "de"))
    expect(fake.create).toHaveBeenCalledWith(KEY)
    expect(fake.textModel).toHaveBeenCalledWith("example/text-model")
    const { run } = hook.result.current
    expect(run).toMatchObject({ phase: "done", error: null, reportError: null, saved: true })
    expect(run.progress?.turns.every((entry) => entry.state === "done")).toBe(true)
    expect(run.progress?.report).toBe("done")
    const saved = store.setAiScore.mock.calls[0]
    expect(saved[0]).toBe(project.meta.id)
    expect(aiScoreSchema.parse(saved[1]).report?.lang).toBe("de")
  })

  it("keeps the score when the report fails", async () => {
    setGatewayKey(KEY)
    const { project, store, hook } = setup({ textStatus: 402 })
    await act(() => hook.result.current.start(project, "x/y", "en"))
    expect(hook.result.current.run).toMatchObject({ phase: "done", reportError: "credits", saved: true })
    expect(hook.result.current.run.progress?.report).toBe("failed")
    expect(store.setAiScore.mock.calls[0][1]?.report).toBeNull()
  })

  it("maps a Gateway error and saves nothing", async () => {
    setGatewayKey(KEY)
    const { project, store, fake, hook } = setup()
    fake.jev.model.doDecide = async () => {
      throw Object.assign(new Error("401"), { statusCode: 401 })
    }
    await act(() => hook.result.current.start(project, "x/y", "en"))
    expect(hook.result.current.run).toMatchObject({ phase: "failed", error: "key" })
    expect(store.setAiScore).not.toHaveBeenCalled()
  })

  it("cancels a run in flight", async () => {
    setGatewayKey(KEY)
    const { project, store, hook } = setup({ hold: true })
    let done: Promise<void> = Promise.resolve()
    act(() => {
      done = hook.result.current.start(project, "x/y", "en")
    })
    await waitFor(() => expect(hook.result.current.run.progress?.turns[1].state).toBe("running"))
    expect(hook.result.current.run.progress?.turns[0].state).toBe("done")
    act(() => hook.result.current.cancel())
    await act(() => done)
    expect(hook.result.current.run).toMatchObject({ phase: "failed", error: "aborted" })
    expect(hook.result.current.run.progress?.turns.map((entry) => entry.state)).toEqual(["done", "failed", "skipped", "skipped", "skipped"])
    expect(store.setAiScore).not.toHaveBeenCalled()
  })

  it("saves even when the plan changed during the run", async () => {
    setGatewayKey(KEY)
    const { project, store, fake, hook } = setup({ hold: true })
    let done: Promise<void> = Promise.resolve()
    act(() => {
      done = hook.result.current.start(project, "x/y", "en")
    })
    await waitFor(() => expect(hook.result.current.run.progress?.turns[1].state).toBe("running"))
    act(() => {
      store.patch({ "site.name": "Renamed while scoring" })
    })
    fake.release()
    await act(() => done)
    expect(store.setAiScore).toHaveBeenCalledTimes(1)
    expect(store.current().aiScore).not.toBeNull()
  })
})
