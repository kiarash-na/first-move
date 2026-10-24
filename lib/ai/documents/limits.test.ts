import { describe, expect, it } from "vitest"
import { checkBatch, DOCUMENT_LIMITS, EMAIL_LIMITS, IN_APP_LIMITS } from "./limits"

const MB = 1024 * 1024

describe("document limits (PLAN-AGENT-03 step 2)", () => {
  it("has the planned caps, shared by both agents for now", () => {
    expect(DOCUMENT_LIMITS).toMatchObject({
      files: 5,
      fileBytes: 10 * MB,
      totalBytes: 20 * MB,
      pdfPages: 60,
      zipEntries: 2_000,
      zipUncompressedBytes: 50 * MB,
      textChars: 200_000,
    })
    expect(IN_APP_LIMITS).toEqual(DOCUMENT_LIMITS)
    expect(EMAIL_LIMITS).toEqual(DOCUMENT_LIMITS)
  })

  it("accepts a batch within the caps", () => {
    expect(checkBatch([{ name: "a.pdf", size: 9 * MB }, { name: "b.xlsx", size: 9 * MB }])).toEqual([])
  })

  it("reports too many files, empty and oversized files, and the total", () => {
    const files = [
      { name: "a.pdf", size: 11 * MB },
      { name: "b.txt", size: 0 },
      ...Array.from({ length: 4 }, (_, index) => ({ name: `${index}.csv`, size: 3 * MB })),
    ]
    expect(checkBatch(files)).toEqual([
      { code: "too-many-files", max: 5 },
      { code: "file-too-large", name: "a.pdf", maxBytes: 10 * MB },
      { code: "empty-file", name: "b.txt" },
      { code: "total-too-large", maxBytes: 20 * MB },
    ])
  })
})
