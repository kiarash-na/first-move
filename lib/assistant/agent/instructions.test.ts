import { describe, expect, it } from "vitest"
import { assistantInstructions } from "./instructions"

describe("assistant instructions", () => {
  it("keep numbers with the engine, changes reviewable and the output plain", () => {
    const text = assistantInstructions("en")
    expect(text).toContain("Never compute, estimate or change them yourself")
    expect(text).toContain("propose_values")
    expect(text).toContain("never say a value was applied")
    expect(text).toContain("No HTML, no images")
    expect(text).toContain("untrusted_document")
    expect(text).toContain("Write in English.")
  })

  it("follow the UI language", () => {
    expect(assistantInstructions("de")).toContain("Write in German.")
    expect(assistantInstructions("de")).toContain("Paths start with /de/.")
  })
})
