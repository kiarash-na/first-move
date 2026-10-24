import { describe, expect, it } from "vitest"
import { tokenize } from "./tokenize"

describe("tokenize", () => {
  it("lower-cases, splits at punctuation and drops stop words and single letters", () => {
    expect(tokenize("What is the Quick Check?")).toEqual(["quick", "check"])
    expect(tokenize("kWh/a, 2026")).toEqual(["kwh", "2026"])
  })

  it("folds umlauts, accents and ß", () => {
    expect(tokenize("Wärme Größe café")).toEqual(tokenize("Warme Grosse cafe"))
  })

  it("stems EN and DE endings the same way for documents and queries", () => {
    expect(tokenize("buildings")).toEqual(tokenize("building"))
    expect(tokenize("Wärmepumpen")).toEqual(tokenize("Wärmepumpe"))
    expect(tokenize("sources")).toEqual(tokenize("source"))
    expect(tokenize("densities")).toEqual(tokenize("density"))
  })

  it("keeps short words and numbers as they are", () => {
    expect(tokenize("COP 4.5 ha")).toEqual(["cop", "4", "5", "ha"])
  })
})
