// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest"
import { MessageSection } from "@/emails/components/message-section"
import { renderText } from "@/emails/render/text"
import { bpQuestions, bpQuestionsSection, guidance, stepFields } from "./questions-bp"
import { loadTexts, type MailTexts } from "./texts"

let t: MailTexts
beforeAll(async () => {
  t = await loadTexts("en")
})

describe("Business Plan questions", () => {
  it("asks one optional question per field of the step, in the dashboard's order", () => {
    const items = bpQuestions("reality-check", t)
    expect(items).toHaveLength(stepFields("reality-check").length)
    expect(items.every((item) => item.optional === "optional")).toBe(true)
    const risks = items.find((item) => item.text === "Risks")!
    expect(risks.hints).toContain("One line per entry: Risk, Description, Potential deal-breaker, How to validate it")
  })

  it("lists the use cases as options", () => {
    const scenario = bpQuestions("opportunity", t).find((item) => item.text === "Use case")!
    expect(scenario.hints.at(-1)).toMatch(/^Options: Scenario 01: Rural village, /)
  })

  it("gives the step's guiding questions and numbers the step in orange", () => {
    expect(guidance("business-logic", t).length).toBeGreaterThan(0)
    const section = bpQuestionsSection("business-logic", t, { askFile: false })
    expect(section).toMatchObject({ accent: "hot", title: "Business Plan, step 2 of 4: Build the business logic" })
    expect(renderText(<MessageSection section={section} />)).toContain("- Who benefits, and who pays?")
  })
})
