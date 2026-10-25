import { describe, expect, it } from "vitest"

import { scorePlan } from "@/lib/ai/plan-score/run"
import { mockJev } from "@/lib/ai/plan-score/test-utils/mock-jev"
import { example, NOW } from "../test-utils/scored"
import { aggregateOfNodes, aggregateOfScore } from "./aggregate-view"

describe("aggregate view", () => {
  it("gives the same numbers live from the nodes as the saved score", async () => {
    const { score, nodes } = await scorePlan(example(), { decisionModel: mockJev({ gates: { anchor: 0.05 } }).model, now: NOW })
    const saved = aggregateOfScore(score)
    expect(aggregateOfNodes(nodes)).toEqual(saved)
    expect(saved.dimensions).toHaveLength(7)
    expect(saved.capped).toBe(true)
  })
})
