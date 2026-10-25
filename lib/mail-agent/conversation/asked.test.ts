// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest"
import { askedQuestions } from "./asked"
import { QC_ASKED } from "./phase"
import { loadTexts, type MailTexts } from "./texts"

let t: MailTexts
beforeAll(async () => {
  t = await loadTexts("en")
})

describe("askedQuestions", () => {
  it("numbers the Quick Check questions as the last email did", () => {
    expect(askedQuestions([QC_ASKED, "qc:mix", "qc:sources"], t)).toEqual([
      { number: 1, text: t.mail.conversation.qc.mix.question, fields: ["buildings.shares"] },
      { number: 2, text: t.mail.conversation.qc.sources.question, fields: ["sources.potentials"] },
    ])
  })

  it("numbers a Business Plan step's fields", () => {
    const asked = askedQuestions(["bp:reality-check"], t)
    expect(asked[0]).toMatchObject({ number: 1, fields: ["businessPlan.assumptions.connectionRate"] })
    expect(asked.at(-1)).toMatchObject({ fields: ["businessPlan.risks"] })
  })

  it("has nothing for the menu, the results or an unknown entry", () => {
    expect(askedQuestions([], t)).toEqual([])
    expect(askedQuestions([QC_ASKED], t)).toEqual([])
    expect(askedQuestions(["bp:elsewhere", "qc:nothing"], t)).toEqual([])
  })
})
