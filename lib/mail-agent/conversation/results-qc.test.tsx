// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest"
import { MessageSection } from "@/emails/components/message-section"
import { renderText } from "@/emails/render/text"
import { run, type QuickCheckComplete } from "@/lib/quick-check"
import { inputRows, qcResultSections } from "./results-qc"
import { projectWith, QUICK_CHECK_ANSWERS } from "./test-utils/project"
import { loadTexts, type MailTexts } from "./texts"

let en: MailTexts
let de: MailTexts
beforeAll(async () => {
  en = await loadTexts("en")
  de = await loadTexts("de")
})

const project = projectWith(QUICK_CHECK_ANSWERS)
const result = run(project) as QuickCheckComplete
const docsUrl = "https://firstmove.energy/en/docs/quick-check"

describe("qcResultSections", () => {
  it("shows the engine's result: level, reasons, factors, indicators, figures, inputs and the disclaimer", () => {
    const [main, notes] = qcResultSections(result, project, en, { docsUrl, updated: false })
    expect(main.accent).toBe("cool")
    const verdict = main.blocks.find((block) => block.type === "verdict")
    expect(verdict).toMatchObject({ level: result.assessment.level, label: en.quickCheck.results.levels[result.assessment.level].label })
    const text = renderText(<MessageSection section={main} />)
    expect(text).toContain("Why this result")
    expect(text).toContain("Heating coverage")
    expect(text).toContain("Building density")
    expect(text).toContain("Screening, not a full feasibility study.")
    expect(text).toContain("Total number of buildings  42")
    expect(notes.title).toBe("How we calculate")
  })

  it("says when it recomputed with new values", () => {
    const [main] = qcResultSections(result, project, en, { docsUrl, updated: true })
    expect(main.blocks[0]).toEqual({ type: "text", text: "Updated with your latest values.", tone: "strong" })
  })

  it("formats in German for a German sender", () => {
    const text = renderText(<MessageSection section={qcResultSections(result, project, de, { docsUrl, updated: false })[0]} />)
    expect(text).toContain("Warum dieses Ergebnis")
    expect(text).toContain("Gesamtfläche des Projektgebiets  35.000 m² (3,5 ha)")
  })
})

describe("inputRows", () => {
  it("lists what was entered and what was estimated", () => {
    const rows = inputRows(project, en)
    expect(rows.find((row) => row.label === "Share of buildings")!.value).toBe("Residential buildings 1961-1990: 60%; Residential buildings 2011-today: 30%; Category A 1991-2010: 10%")
    expect(rows.find((row) => row.label === "Energy sources")!.value).toBe("Ground water: High; Ambient air: Medium")
    expect(rows.find((row) => row.label === "Network length")!.value).toBe("estimated")
  })
})
