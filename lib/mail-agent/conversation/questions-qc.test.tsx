// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest"
import { renderText } from "@/emails/render/text"
import { MessageSection } from "@/emails/components/message-section"
import { QC_QUESTION_IDS, qcQuestions, qcQuestionsSection, questionFor } from "./questions-qc"
import { loadTexts, type MailTexts } from "./texts"

let en: MailTexts
let de: MailTexts
beforeAll(async () => {
  en = await loadTexts("en")
  de = await loadTexts("de")
})

describe("Quick Check questions", () => {
  it("asks about eight things, numbered, each with an example", () => {
    const items = qcQuestions(QC_QUESTION_IDS, en)
    expect(items.map((item) => item.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(items[0]).toMatchObject({ text: "What is the project called?", optional: "optional" })
    expect(items.every((item) => item.hints.some((hint) => hint.startsWith("Example: ")))).toBe(true)
  })

  it("lists the building types, periods and sources as the dashboard names them", () => {
    const [mix, sources] = qcQuestions(["mix", "sources"], en)
    expect(mix.hints[0]).toContain("Category A (Retail, museums")
    expect(mix.hints[1]).toBe("Construction periods: -1919, 1919-1960, 1961-1990, 1991-2010 and 2011-today")
    expect(sources.hints[0]).toContain("Ground water")
    expect(qcQuestions(["sources"], de)[0].text).toMatch(/Energiequellen/)
  })

  it("asks only the given questions in a follow-up, numbered from 1, and about the file when open", () => {
    const section = qcQuestionsSection(["area", "mix"], en, { followUp: true, askFile: true })
    const text = renderText(<MessageSection section={section} />)
    expect(section.title).toBe("Quick Check: still needed")
    expect(text).toContain("1.  How large is the project area")
    expect(text).toContain("2.  What is the building mix?")
    expect(text).toContain("would you like the project file")
    expect(text).not.toContain("attach documents")
  })

  it("maps a field to the question that asks for it", () => {
    expect(questionFor("buildings.shares.industry.until_1919")).toBe("mix")
    expect(questionFor("buildings.shares")).toBe("mix")
    expect(questionFor("quickCheck.manualDemand.heatingKwhPerYear")).toBe("demand")
    expect(questionFor("site.name")).toBeNull()
  })
})
