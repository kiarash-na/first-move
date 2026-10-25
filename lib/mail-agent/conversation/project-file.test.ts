// @vitest-environment node
import { describe, expect, it } from "vitest"
import { parseImportText } from "@/lib/storage/import"
import { applyProposal } from "./apply"
import { projectAttachment } from "./project-file"
import { projectWith, QUICK_CHECK_ANSWERS } from "./test-utils/project"

describe("projectAttachment", () => {
  it("is an export the dashboard imports, with the email agent's marks", () => {
    const base = projectWith(QUICK_CHECK_ANSWERS)
    const proposal = { patch: { "quickCheck.networkLengthM": 1800 }, valid: [{ key: "quickCheck.networkLengthM", value: 1800, label: "Network length", sources: [{ quote: "1800 m" }] }], invalid: [], incomplete: [], conflicts: [], unclear: [], notes: [] }
    const { project } = applyProposal(base, proposal, { model: "anthropic/text-model-test", now: new Date(Date.UTC(2026, 9, 25)) })
    const file = projectAttachment(project, new Date(Date.UTC(2026, 9, 25)))
    expect(file.filename).toMatch(/\.firstmove\.json$/)
    expect(file.contentType).toBe("application/json")
    const imported = parseImportText(Buffer.from(file.content, "base64").toString("utf8"))
    expect(imported.ok && imported.project.quickCheck.networkLengthM).toBe(1800)
    expect(imported.ok && imported.project.provenance.ai["quickCheck.networkLengthM"]).toMatchObject({ by: "email", model: "anthropic/text-model-test" })
  })
})
