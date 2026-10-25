// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest"
import { MessageSection } from "@/emails/components/message-section"
import { renderText } from "@/emails/render/text"
import type { Section } from "@/emails/model"
import { answerSection, fileNoteSection, filesSection, handoffSection, limitSection, menuSection, reminderSection, restartedSection, stoppedSection } from "./sections"
import { loadTexts, type MailTexts } from "./texts"

let en: MailTexts
let de: MailTexts
beforeAll(async () => {
  en = await loadTexts("en")
  de = await loadTexts("de")
})

const text = (section: Section) => renderText(<MessageSection section={section} />)

describe("conversation sections", () => {
  it("offers the three choices and the file in the menu", () => {
    const menu = text(menuSection(en, { again: false, askFile: true }))
    expect(menu).toContain("1  Quick Check")
    expect(menu).toContain("3  Both")
    expect(menu).toContain("project file (.firstmove.json)")
    expect(menu).toContain("for example: 1, yes")
    expect(text(menuSection(de, { again: true, askFile: false }))).toContain("Bitte wählen Sie 1, 2 oder 3.")
  })

  it("answers with the page, or points to the docs", () => {
    const page = { title: "Quick Check", url: "https://firstmove.energy/en/docs/quick-check" }
    expect(text(answerSection({ text: "It is the demand per metre.", page }, en, "https://firstmove.energy/en/docs"))).toContain("More in the docs: Quick Check (https://firstmove.energy/en/docs/quick-check)")
    expect(text(answerSection({ text: null, page: null }, en, "https://firstmove.energy/en/docs"))).toContain("I can't answer that by email. The docs explain how First Move works: https://firstmove.energy/en/docs")
  })

  it("reports each file", () => {
    const files = text(
      filesSection(
        [
          { name: "a.pdf", status: "read" },
          { name: "b.firstmove.json", status: "imported" },
          { name: "c.jpg", status: "skipped", reason: "unsupported" },
          { name: "d.json", status: "skipped", reason: "project", detail: "newer-version" },
        ],
        en,
        "cool",
      ),
    )
    expect(files).toContain("- Read: a.pdf")
    expect(files).toContain("- Opened the project file b.firstmove.json.")
    expect(files).toContain("- Skipped: c.jpg (this file type can't be read; please send PDF, Word, Excel, CSV or text)")
    expect(files).toMatch(/- Skipped: d\.json \(the project file could not be opened: .+\)/)
  })

  it("explains the attached file and its AI marks", () => {
    const note = text(fileNoteSection(en, { attached: true, fileName: "sonnenhof.firstmove.json", dashboardUrl: "https://firstmove.energy/en/dashboard" }))
    expect(note).toContain("Your project file is attached: sonnenhof.firstmove.json.")
    expect(note).toContain("marked as AI-proposed")
  })

  it("has a line for every phase, the hand-off, the end, a restart and the limit", () => {
    expect(text(reminderSection("collect", en))).toContain("still collecting")
    expect(text(handoffSection(en))).toContain("human@mail.firstmove.energy")
    expect(text(stoppedSection(en, { hadConversation: true }))).toContain("deleted the project data")
    expect(text(stoppedSection(en, { hadConversation: false }))).toContain("There was no conversation to end.")
    expect(text(restartedSection(de))).toContain("Wir beginnen von vorne.")
    expect(text(limitSection(en, "https://firstmove.energy/en/dashboard"))).toContain("https://firstmove.energy/en/dashboard")
  })
})
