// @vitest-environment node
import { describe, expect, it } from "vitest"
import { alt, contentType, size } from "./opengraph-image"

describe("opengraph-image", () => {
  it("is a 1200×630 PNG with alt text", () => {
    expect(size).toEqual({ width: 1200, height: 630 })
    expect(contentType).toBe("image/png")
    expect(alt).toContain("First Move")
  })
})
