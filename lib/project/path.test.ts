// @vitest-environment node
import { describe, expect, it } from "vitest"
import { getAt, hasPath, isIndexSegment, joinPath, parsePath, setAt } from "./path"

const root = { a: { b: 1, list: [{ x: "one" }, { x: "two" }] }, n: null as number | null }

describe("parsePath / joinPath", () => {
  it("splits and joins dot paths", () => {
    expect(parsePath("buildings.shares.residential.1991_2010")).toEqual([
      "buildings",
      "shares",
      "residential",
      "1991_2010",
    ])
    expect(joinPath(["businessPlan", "risks", 0, "title"])).toBe("businessPlan.risks.0.title")
  })

  it("rejects empty and unsafe segments", () => {
    for (const path of ["", "a..b", ".a", "a.", "a.__proto__", "constructor", "a.prototype.b", "a b", "a/b"]) {
      expect(parsePath(path), path).toBeNull()
    }
  })
})

describe("isIndexSegment", () => {
  it("accepts canonical indices only", () => {
    expect(["0", "1", "12"].every(isIndexSegment)).toBe(true)
    expect(["01", "-1", "1.5", "a"].some(isIndexSegment)).toBe(false)
  })
})

describe("hasPath / getAt", () => {
  it("reads own keys and list indices", () => {
    expect(getAt(root, ["a", "b"])).toBe(1)
    expect(getAt(root, ["a", "list", "1", "x"])).toBe("two")
    expect(getAt(root, ["n"])).toBeNull()
    expect(hasPath(root, ["n"])).toBe(true)
  })

  it("treats missing keys, out-of-range indices and inherited keys as absent", () => {
    expect(hasPath(root, ["a", "missing"])).toBe(false)
    expect(hasPath(root, ["a", "list", "2"])).toBe(false)
    expect(hasPath(root, ["a", "list", "01"])).toBe(false)
    expect(hasPath(root, ["a", "toString"])).toBe(false)
    expect(hasPath(root, ["n", "x"])).toBe(false)
    expect(getAt(root, ["a", "missing"])).toBeUndefined()
  })
})

describe("setAt", () => {
  it("returns a copy with the value set, sharing untouched branches", () => {
    const next = setAt(root, ["a", "list", "0", "x"], "uno")
    expect(next.a.list[0].x).toBe("uno")
    expect(root.a.list[0].x).toBe("one")
    expect(next.a.list[1]).toBe(root.a.list[1])
    expect(next.n).toBe(root.n)
  })

  it("replaces the root for an empty path", () => {
    expect(setAt(root, [], 5)).toBe(5)
  })

  it("throws for a path that does not exist", () => {
    expect(() => setAt(root, ["a", "missing"], 1)).toThrow(/does not exist/)
  })
})
