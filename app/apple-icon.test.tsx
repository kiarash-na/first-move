// @vitest-environment node
import { describe, expect, it } from "vitest"
import { contentType, size } from "./apple-icon"

describe("apple-icon", () => {
  it("is a 180×180 PNG", () => {
    expect(size).toEqual({ width: 180, height: 180 })
    expect(contentType).toBe("image/png")
  })
})
