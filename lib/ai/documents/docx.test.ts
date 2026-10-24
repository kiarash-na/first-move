// @vitest-environment node
import { describe, expect, it } from "vitest"
import { readDocx } from "./docx"
import { makeDocx } from "./test-utils/office"
import { makeZip } from "./test-utils/zip"

describe("readDocx", () => {
  it("reads the paragraphs as raw text", async () => {
    const result = await readDocx(await makeDocx(["Feasibility study", "120 buildings on 12 ha", "Wärmepumpen & Geothermie"]))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.text).toContain("Feasibility study")
    expect(result.text).toContain("120 buildings on 12 ha")
    expect(result.text).toContain("Wärmepumpen & Geothermie")
  })

  it("reports a ZIP without a Word document as corrupt", async () => {
    expect(await readDocx(await makeZip([{ name: "[Content_Types].xml", data: "<Types/>" }]))).toEqual({ ok: false, error: "corrupt" })
    expect(await readDocx(new TextEncoder().encode("not a zip"))).toEqual({ ok: false, error: "corrupt" })
  })
})
