import { describe, expect, it } from "vitest"
import { scorePlan } from "@/lib/ai/plan-score/run"
import { mockJev } from "@/lib/ai/plan-score/test-utils/mock-jev"
import { TEXT_MODELS } from "@/lib/assistant/gateway/models"
import { createProject } from "@/lib/project"
import { example, NOW } from "../test-utils/scored"
import { estimateCost, JEV_INPUT_PRICE, REPORT_OUTPUT_TOKENS, roughAmount } from "./cost"

describe("cost estimate", () => {
  it("prices four Jev turns at Jev's input price and the report at the model's prices", () => {
    const sonnet = TEXT_MODELS[0]
    const estimate = estimateCost(example(), sonnet)
    expect(estimate.decisionUsd).toBeCloseTo((estimate.decisionTokens * JEV_INPUT_PRICE) / 1e6, 12)
    expect(estimate.textOutputTokens).toBe(REPORT_OUTPUT_TOKENS)
    expect(estimate.textUsd).toBeCloseTo((estimate.textInputTokens * 2 + REPORT_OUTPUT_TOKENS * 10) / 1e6, 12)
    expect(estimate.totalUsd).toBeCloseTo(estimate.decisionUsd + estimate.textUsd!, 12)
  })

  it("lands in the order of magnitude a mocked run reports", async () => {
    const jev = mockJev({ inputTokens: 0 })
    const project = example()
    const estimate = estimateCost(project, null)
    await scorePlan(project, { decisionModel: jev.model, now: NOW })
    const sent = jev.calls.reduce((sum, call) => sum + Math.ceil((JSON.stringify(call.state).length + JSON.stringify(call.questions).length) / 3), 0)
    expect(estimate.decisionTokens / sent).toBeGreaterThan(0.7)
    expect(estimate.decisionTokens / sent).toBeLessThan(1.3)
  })

  it("leaves the text price open for an unknown model, and an empty plan costs only the questions", () => {
    const empty = createProject({ modules: { businessPlan: true }, id: "11111111-1111-4111-8111-111111111111", now: NOW() })
    const estimate = estimateCost(empty, null)
    expect(estimate.textUsd).toBeNull()
    expect(estimate.totalUsd).toBeNull()
    expect(estimate.decisionTokens).toBeLessThan(estimateCost(example(), null).decisionTokens)
  })

  it("rounds to one significant digit, with a floor", () => {
    expect(roughAmount(0.0234)).toEqual({ below: false, value: 0.02 })
    expect(roughAmount(0.0076)).toEqual({ below: false, value: 0.008 })
    expect(roughAmount(1.6)).toEqual({ below: false, value: 2 })
    expect(roughAmount(0.0004)).toEqual({ below: true, value: 0.001 })
  })
})
