import { describe, expect, it } from "vitest"
import { checkAnchor, keyAnchor, partAnchor } from "./anchors"

describe("result anchors", () => {
  it("points a judgement key to its plan part row and a gate key to its check row", () => {
    expect(keyAnchor("pain-point")).toBe(partAnchor("pain-point"))
    expect(keyAnchor("boundary")).toBe(checkAnchor("boundary"))
    expect(keyAnchor("water-permit")).toBe(checkAnchor("water-permit"))
    expect(keyAnchor("unknown")).toBeNull()
  })

  it("makes ids that differ between parts and checks", () => {
    expect(partAnchor("ownership")).not.toBe(checkAnchor("ownership"))
  })
})
