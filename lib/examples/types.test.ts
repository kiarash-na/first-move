import { describe, expect, it } from "vitest"
import { text } from "./types"

describe("text", () => {
  it("builds an English-only or a bilingual text", () => {
    expect(text("Hello")).toEqual({ en: "Hello" })
    expect(text("Hello", "Hallo")).toEqual({ en: "Hello", de: "Hallo" })
  })
})
