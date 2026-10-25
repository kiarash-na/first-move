import { describe, expect, it } from "vitest"
import { edgePath, RAIL_OFFSET, relativeBox } from "./edge-path"

describe("edge path", () => {
  it("curves from the branch's right edge to the check's left edge when side by side", () => {
    expect(edgePath({ left: 0, top: 0, width: 100, height: 40 }, { left: 140, top: 100, width: 100, height: 20 })).toBe("M 100 20 C 120 20, 120 110, 140 110")
  })

  it("keeps a minimum bend for close columns", () => {
    expect(edgePath({ left: 0, top: 0, width: 100, height: 40 }, { left: 104, top: 0, width: 100, height: 40 })).toBe("M 100 20 C 116 20, 88 20, 104 20")
  })

  it("runs on a rail left of stacked nodes", () => {
    const rail = 16 - RAIL_OFFSET
    expect(edgePath({ left: 16, top: 400, width: 300, height: 40 }, { left: 16, top: 900, width: 300, height: 40 })).toBe(`M 16 420 C ${rail} 420, ${rail} 920, 16 920`)
  })

  it("measures relative to the container", () => {
    const rect = (left: number, top: number, width: number, height: number) => ({ left, top, width, height }) as DOMRect
    expect(relativeBox(rect(120, 230, 50, 20), rect(100, 200, 900, 600))).toEqual({ left: 20, top: 30, width: 50, height: 20 })
  })
})
