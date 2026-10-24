// @vitest-environment node
import { describe, expect, it } from "vitest"
import { CANVAS_BLOCKS, FOCUS_CANVAS_BLOCKS } from "./canvas-blocks"

describe("canvas blocks", () => {
  it("has the nine classic blocks plus operator responsibilities (BM-STEP-02)", () => {
    expect(CANVAS_BLOCKS).toHaveLength(10)
    expect(new Set(CANVAS_BLOCKS).size).toBe(CANVAS_BLOCKS.length)
    expect(CANVAS_BLOCKS).toContain("operatorResponsibilities")
  })

  it("names the six focus blocks of BM-STEP-02", () => {
    expect(FOCUS_CANVAS_BLOCKS).toHaveLength(6)
    for (const block of FOCUS_CANVAS_BLOCKS) expect(CANVAS_BLOCKS).toContain(block)
  })
})
