import { describe, expect, it } from "vitest"
import { getExample, localizeExample } from "@/lib/examples"
import { reportPrompt } from "./report"
import { scorePlan } from "./run"
import { suggestPrompt } from "./suggest"
import { mockJev } from "./test-utils/mock-jev"
import { LANGUAGE_NAME, LANGUAGE_RULE } from "./text-input"

const project = localizeExample(getExample("housing-cooperatives")!, "de")
const now = () => new Date("2026-10-24T12:00:00.000Z")

describe("the language instruction of the text model", () => {
  it("names the language of each text", () => {
    for (const lang of ["en", "de"] as const) expect(LANGUAGE_RULE[lang]).toContain(`Write in ${LANGUAGE_NAME[lang]}.`)
  })

  it("has German texts address the reader formally, like the UI: Sie, never du or ihr", () => {
    expect(LANGUAGE_RULE.de).toContain('"Sie"')
    expect(LANGUAGE_RULE.de).toMatch(/Never use the informal "du"/)
    expect(LANGUAGE_RULE.de).toMatch(/informal plural "ihr"/)
    expect(LANGUAGE_RULE.en).not.toContain("Sie")
  })

  it("is part of the report and the suggestion prompts", async () => {
    const { score } = await scorePlan(project, { decisionModel: mockJev({ levels: {} }).model, now })
    for (const lang of ["en", "de"] as const) {
      expect(reportPrompt(project, score, lang).system).toContain(LANGUAGE_RULE[lang])
      expect(suggestPrompt(project, ["financing"], lang).system).toContain(LANGUAGE_RULE[lang])
    }
    expect(reportPrompt(project, score, "de").system).toContain('"Sie"')
    expect(suggestPrompt(project, ["financing"], "de").system).toContain('"Sie"')
  })
})
