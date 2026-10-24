import { describe, expect, it } from "vitest"
import { extraKeys, missingKeys } from "./dictionary-keys"

const en = { a: "A", group: { b: "B", c: "C" } }

describe("extraKeys", () => {
  it("is empty for a partial subset", () => {
    expect(extraKeys(en, { group: { b: "Bee" } })).toEqual([])
    expect(extraKeys(en, {})).toEqual([])
  })

  it("lists keys the base lacks, with their path", () => {
    expect(extraKeys(en, { x: "X", group: { d: "D" } })).toEqual(["x", "group.d"])
  })

  it("lists keys whose kind differs", () => {
    expect(extraKeys(en, { a: { nested: "no" }, group: "flat" })).toEqual(["a", "group"])
  })
})

describe("missingKeys", () => {
  it("lists every leaf the other object lacks or leaves empty", () => {
    expect(missingKeys(en, { group: { b: "Bee", c: "" } })).toEqual(["a", "group.c"])
    expect(missingKeys(en, en)).toEqual([])
  })
})
