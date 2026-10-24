import { describe, expect, it } from "vitest"
import { nodeText } from "./node-text"

describe("nodeText", () => {
  it("returns strings and numbers as they are", () => {
    expect(nodeText("Quick Check")).toBe("Quick Check")
    expect(nodeText(5)).toBe("5")
  })

  it("joins arrays and the children of elements", () => {
    expect(nodeText(["Step ", 1, ": ", <strong key="a">Opportunity</strong>])).toBe("Step 1: Opportunity")
    expect(nodeText(<span>Nested <em>text</em></span>)).toBe("Nested text")
  })

  it("ignores empty values", () => {
    expect(nodeText(null)).toBe("")
    expect(nodeText(undefined)).toBe("")
    expect(nodeText(false)).toBe("")
    expect(nodeText(<br />)).toBe("")
  })
})
