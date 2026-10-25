import { Experimental_DecisionRefusalError } from "ai"
import { Experimental_DecisionMockModelV4 } from "ai/test"
import { describe, expect, it } from "vitest"
import { DECISION_PROVIDER_OPTIONS, decideTurn } from "./decide-turn"

const questions = {
  a: { type: "boolean" as const, instructions: "A?" },
  b: { type: "boolean" as const, instructions: "B?" },
}

describe("decideTurn", () => {
  it("asks nothing for no questions", async () => {
    const model = new Experimental_DecisionMockModelV4({ doDecide: async () => { throw new Error("called") } })
    expect(await decideTurn(model, { plan: [] }, {})).toEqual({ answers: {}, inputTokens: 0 })
  })

  it("retries once without a declined question and reports it as refused", async () => {
    const asked: string[][] = []
    const model = new Experimental_DecisionMockModelV4({
      doDecide: async ({ questions: q }) => {
        asked.push(Object.keys(q))
        return { answers: Object.fromEntries(Object.keys(q).map((id) => [id, id === "a" ? { type: "refusal" as const } : { type: "boolean" as const, probability: 0.7 }])), usage: { inputTokens: 50 }, warnings: [] }
      },
    })
    const result = await decideTurn(model, { plan: [] }, questions)
    expect(asked).toEqual([["a", "b"], ["b"]])
    expect(result).toEqual({ answers: { a: { type: "refusal" }, b: { type: "boolean", probability: 0.7 } }, inputTokens: 50 })
  })

  it("throws other errors", async () => {
    const model = new Experimental_DecisionMockModelV4({ doDecide: async () => { throw new Error("401") } })
    await expect(decideTurn(model, { plan: [] }, questions)).rejects.toThrow("401")
    expect(Experimental_DecisionRefusalError).toBeDefined()
  })

  it("passes the run provider's options to the model, with the Gateway privacy options as the default", async () => {
    const seen: unknown[] = []
    const model = new Experimental_DecisionMockModelV4({
      doDecide: async ({ providerOptions }) => {
        seen.push(providerOptions)
        return { answers: { a: { type: "boolean" as const, probability: 0.5 } }, usage: { inputTokens: 10 }, warnings: [] }
      },
    })
    await decideTurn(model, { plan: [] }, { a: questions.a }, undefined, { openrouter: { provider: { data_collection: "deny" } } })
    await decideTurn(model, { plan: [] }, { a: questions.a })
    expect(seen).toEqual([
      { openrouter: { provider: { data_collection: "deny" } } },
      DECISION_PROVIDER_OPTIONS,
    ])
  })
})
