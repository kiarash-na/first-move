import { describe, expect, it } from "vitest"
import { FIRST_MOVE_SCOPE, languageRule } from "./scope"

describe("scope", () => {
  it("names both modules, the topic and that results are deterministic", () => {
    for (const part of ["5GDHC", "Quick Check", "Business Plan", "never from you"]) expect(FIRST_MOVE_SCOPE).toContain(part)
  })

  it("names the language to write in", () => {
    expect(languageRule("en")).toBe("Write in English.")
    expect(languageRule("de")).toBe("Write in German.")
  })
})
