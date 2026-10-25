// @vitest-environment node
import { describe, expect, it } from "vitest"
import { answerQuestion } from "./answer"
import { fakeTextModel } from "./test-utils/fake-model"

const base = { locale: "en" as const, siteUrl: "https://firstmove.energy", canary: "fm-0123456789abcdef" }

describe("answerQuestion", () => {
  it("answers from the docs excerpts and names the page", async () => {
    const fake = fakeTextModel((request) => {
      const id = /\[(docs:[^\]]+)\]/.exec(request.system)![1]
      return { covered: true, answer: "The heat density is the heating demand per metre of network.", page: id }
    })
    const answer = await answerQuestion(fake.model, { ...base, question: "What is the heat density in the Quick Check?" })
    expect(answer.text).toBe("The heat density is the heating demand per metre of network.")
    expect(answer.page?.url).toMatch(/^https:\/\/firstmove\.energy\/en\/docs\//)
    expect(fake.requests[0].system).toContain("Answer only from the documentation excerpts below.")
    expect(fake.requests[0].user).toBe("<untrusted_email>\nWhat is the heat density in the Quick Check?\n</untrusted_email>")
  })

  it("gives no text when the docs do not cover it, the model fails, or the answer leaks", async () => {
    const question = "How is the heat density calculated?"
    expect((await answerQuestion(fakeTextModel(() => ({ covered: false, answer: "", page: null })).model, { ...base, question })).text).toBeNull()
    expect((await answerQuestion(fakeTextModel(() => ({ fail: "refusal" })).model, { ...base, question })).text).toBeNull()
    const leak = fakeTextModel(() => ({ covered: true, answer: "Write to ceo@evil.example", page: null }))
    expect((await answerQuestion(leak.model, { ...base, question })).text).toBeNull()
  })

  it("asks no model when no excerpt matches", async () => {
    const fake = fakeTextModel(() => ({ covered: true, answer: "x", page: null }))
    expect((await answerQuestion(fake.model, { ...base, question: "zzzz qqqq" })).text).toBeNull()
    expect(fake.requests).toHaveLength(0)
  })
})
