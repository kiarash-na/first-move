import { describe, expect, it } from "vitest"
import { fingerprint } from "./fingerprint"

describe("fingerprint", () => {
  it("is eight hex digits and stable for the same value", () => {
    const value = { a: 1, b: [1.5, "x", null], c: { d: true } }
    expect(fingerprint(value)).toMatch(/^[0-9a-f]{8}$/)
    expect(fingerprint(value)).toBe(fingerprint(structuredClone(value)))
  })

  it("ignores key order but not values", () => {
    expect(fingerprint({ a: 1, b: 2 })).toBe(fingerprint({ b: 2, a: 1 }))
    expect(fingerprint({ a: 1, b: 2 })).not.toBe(fingerprint({ a: 1, b: 2.0000001 }))
  })

  it("is FNV-1a over the JSON text", () => {
    // FNV-1a 32 of the three characters "a" (with quotes); of the bare `a` it is e40c292c.
    expect(fingerprint("a")).toBe("61a1cfea")
  })
})
