import { describe, expect, it } from "vitest"

import { scorePlan, type RunEvent } from "@/lib/ai/plan-score/run"
import { mockJev } from "@/lib/ai/plan-score/test-utils/mock-jev"
import { example, NOW } from "../test-utils/scored"
import { applyEvent, currentStep, finishProgress, startProgress, stopProgress } from "./progress"

async function events(): Promise<RunEvent[]> {
  const list: RunEvent[] = []
  await scorePlan(example(), { decisionModel: mockJev().model, now: NOW, onEvent: (event) => list.push(event) })
  return list
}

describe("run progress", () => {
  it("starts with every step waiting", () => {
    const progress = startProgress()
    expect(progress.turns.map((entry) => [entry.turn, entry.state])).toEqual([[0, "pending"], [1, "pending"], [2, "pending"], [3, "pending"], [4, "pending"]])
    expect(currentStep(progress)).toBeNull()
    expect(currentStep(null)).toBeNull()
  })

  it("follows the engine's events turn by turn, then waits for the report", async () => {
    const list = await events()
    let progress = startProgress()
    progress = applyEvent(progress, list[0])
    expect(currentStep(progress)).toBe(0)
    progress = list.slice(1, 4).reduce(applyEvent, progress)
    expect(progress.turns[1]).toMatchObject({ state: "done", inputTokens: 1000 })
    expect(progress.turns[1].questions).toBeGreaterThan(5)
    expect(currentStep(progress)).toBeNull()
    progress = list.slice(4).reduce(applyEvent, progress)
    expect(progress.turns.every((entry) => entry.state === "done")).toBe(true)
    expect(progress.report).toBe("running")
    expect(currentStep(progress)).toBe("report")
    expect(progress.nodes.filter((node) => node.kind === "signal")).toHaveLength(1)
    expect(finishProgress(progress, false).report).toBe("done")
    expect(finishProgress(progress, true).report).toBe("failed")
  })

  it("marks the running step failed and the rest not run when it stops", async () => {
    const list = await events()
    const progress = stopProgress(list.slice(0, 3).reduce(applyEvent, startProgress()))
    expect(progress.turns.map((entry) => entry.state)).toEqual(["done", "failed", "skipped", "skipped", "skipped"])
    expect(progress.report).toBe("skipped")
  })
})
