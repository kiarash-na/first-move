// @vitest-environment node
import { describe, expect, it } from "vitest"
import { readPdf } from "./pdf"
import { makePdf } from "./test-utils/pdf"

describe("readPdf", () => {
  it("reads the text page by page", async () => {
    const result = await readPdf(makePdf(["Total buildings: 120\nProject area: 12 ha", "Wärmebedarf 2,5 GWh/a"]), 60)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.total).toBe(2)
    expect(result.pages[0]).toContain("Total buildings: 120")
    expect(result.pages[0]).toContain("Project area: 12 ha")
    expect(result.pages[1]).toContain("Wärmebedarf 2,5 GWh/a")
  })

  it("reads only the first pages up to the cap", async () => {
    const result = await readPdf(makePdf(["one", "two", "three"]), 2)
    expect(result.ok && { pages: result.pages.length, total: result.total }).toEqual({ pages: 2, total: 3 })
  })

  it("reports a password-protected PDF as encrypted", async () => {
    expect(await readPdf(makePdf(["secret"], { encrypted: true }), 60)).toEqual({ ok: false, error: "encrypted" })
  })

  it("returns empty pages for an image-only PDF (no OCR)", async () => {
    const result = await readPdf(makePdf(["", ""], { imageOnly: true }), 60)
    expect(result.ok && result.pages.every((page) => page.trim() === "")).toBe(true)
  })

  it("reports broken files as corrupt", async () => {
    expect(await readPdf(new TextEncoder().encode("%PDF-1.7\nthis is not a pdf"), 60)).toEqual({ ok: false, error: "corrupt" })
    const pdf = makePdf(["text"])
    expect(await readPdf(pdf.subarray(0, 40), 60)).toEqual({ ok: false, error: "corrupt" })
  })

  it("leaves the caller's bytes usable", async () => {
    const pdf = makePdf(["again"])
    await readPdf(pdf, 60)
    expect(pdf.byteLength).toBeGreaterThan(0)
    expect((await readPdf(pdf, 60)).ok).toBe(true)
  })
})
