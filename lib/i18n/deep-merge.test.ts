import { describe, expect, it } from "vitest"
import { deepMerge } from "./deep-merge"

const en = {
  title: "Title",
  nested: { a: "A", b: "B", deeper: { c: "C" } },
  list: ["one", "two"],
  count: 1,
}

describe("deepMerge", () => {
  it("returns the base unchanged without overrides", () => {
    expect(deepMerge(en, {})).toEqual(en)
    expect(deepMerge(en, undefined)).toEqual(en)
  })

  it("overrides nested strings and keeps missing ones", () => {
    const merged = deepMerge(en, { nested: { b: "Bee", deeper: { c: "See" } } })
    expect(merged.nested).toEqual({ a: "A", b: "Bee", deeper: { c: "See" } })
    expect(merged.title).toBe("Title")
  })

  it("treats an empty string as missing", () => {
    expect(deepMerge(en, { title: "" }).title).toBe("Title")
  })

  it("ignores keys and kinds the base does not have", () => {
    const merged = deepMerge(en, { extra: "x", title: { wrong: "kind" }, nested: "flat" })
    expect(merged).toEqual(en)
    expect("extra" in merged).toBe(false)
  })

  it("replaces arrays and same-kind primitives wholesale", () => {
    const merged = deepMerge(en, { list: ["eins"], count: 2 })
    expect(merged.list).toEqual(["eins"])
    expect(merged.count).toBe(2)
  })

  it("does not mutate its inputs", () => {
    const override = { nested: { a: "Ah" } }
    deepMerge(en, override)
    expect(en.nested.a).toBe("A")
    expect(override).toEqual({ nested: { a: "Ah" } })
  })
})
