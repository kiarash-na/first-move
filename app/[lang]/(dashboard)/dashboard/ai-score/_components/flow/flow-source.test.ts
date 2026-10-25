import { describe, expect, it } from "vitest"

import { scorePlan, type RunEvent } from "@/lib/ai/plan-score/run"
import { mockJev } from "@/lib/ai/plan-score/test-utils/mock-jev"
import { applyEvent, startProgress, stopProgress } from "../run/progress"
import { example, NOW, scored } from "../test-utils/scored"
import { aggregateOfScore } from "./aggregate-view"
import { flowView } from "./flow-source"

async function run() {
  const events: RunEvent[] = []
  const result = await scorePlan(example(), { decisionModel: mockJev().model, now: NOW, onEvent: (event) => events.push(event) })
  return { events, ...result }
}

describe("flow source", () => {
  it("waits everywhere before a run", () => {
    const view = flowView({ mode: "idle" })
    expect(view.graph.signal).toBeUndefined()
    expect(Object.values(view.states.turns).map((entry) => entry.state)).toEqual(["pending", "pending", "pending", "pending", "pending"])
    expect(view.aggregate).toBeNull()
  })

  it("grows live and aggregates once the four turns are done", async () => {
    const { events, score } = await run()
    const halfway = events.slice(0, 5).reduce(applyEvent, startProgress())
    const live = flowView({ mode: "live", progress: halfway })
    expect(live.states.turns[2]).toMatchObject({ state: "running" })
    expect(live.states.turns[2].questions).toBeGreaterThan(0)
    expect(live.aggregate).toBeNull()
    expect(live.graph.turns[0].judgements.length).toBeGreaterThan(0)
    expect(live.graph.turns[1].judgements).toHaveLength(0)
    const all = flowView({ mode: "live", progress: events.reduce(applyEvent, startProgress()) })
    expect(all.states.report).toBe("running")
    expect(all.aggregate).toEqual(aggregateOfScore(score))
    expect(flowView({ mode: "live", progress: stopProgress(halfway) }).states.aggregate).toBe("skipped")
  })

  it("shows a saved score as done, with its report state", async () => {
    const score = await scored()
    const view = flowView({ mode: "saved", score, changed: ["site"], writing: false })
    expect(Object.values(view.states.turns).every((entry) => entry.state === "done")).toBe(true)
    expect(view.states.report).toBe("none")
    expect(view.graph.turns[0].judgements.find((node) => node.id === "site")?.changed).toBe(true)
    expect(flowView({ mode: "saved", score, changed: [], writing: true }).states.report).toBe("running")
  })
})
