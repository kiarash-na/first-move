// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest"
import { run, type QuickCheckComplete } from "@/lib/quick-check"
import { calcNotes, calcNotesSection } from "./calc-notes"
import { projectWith, QUICK_CHECK_ANSWERS } from "./test-utils/project"
import { loadTexts, type MailTexts } from "./texts"

let t: MailTexts
beforeAll(async () => {
  t = await loadTexts("en")
})

const complete = (patch = {}) => run(projectWith({ ...QUICK_CHECK_ANSWERS, ...patch })) as QuickCheckComplete

describe("calcNotes", () => {
  it("explains each result with its sentence and the methodology's equation ids", () => {
    const notes = calcNotes(complete(), t)
    const coverage = notes.find((note) => note.title === "Heating coverage")!
    expect(coverage.text).toMatch(/^The heating supply divided by the heating demand/)
    expect(coverage.formulas).toEqual(["EQ-3.8a Heating supply per source", "EQ-3.2c Total annual heating demand", "EQ-3.6a Heating supply coverage"])
    expect(notes.find((note) => note.title === "Economic assessment")!.formulas.at(-1)).toBe("OQ-21 Economic ratio")
  })

  it("drops the estimate's equations when the sender gave the value", () => {
    const notes = calcNotes(complete({ "quickCheck.networkLengthM": 1800 }), t)
    const length = notes.find((note) => note.title === "Network length")!
    expect(length.formulas).toEqual([])
    expect(length.text).toBe("You entered the network length, so it replaces the estimate.")
  })

  it("links every equation in the docs", () => {
    const section = calcNotesSection(complete(), t, "https://firstmove.energy/en/docs/quick-check")
    expect(section.title).toBe("How we calculate")
    expect(section.blocks[0]).toMatchObject({ type: "text", text: expect.stringContaining("https://firstmove.energy/en/docs/quick-check") })
  })
})
