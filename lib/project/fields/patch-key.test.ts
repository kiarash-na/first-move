// @vitest-environment node
import { describe, expect, it } from "vitest"
import { parsePath } from "@/lib/project/path"
import { isPatchKey, ITEM_LISTS, matchItemPath } from "./patch-key"

describe("isPatchKey", () => {
  it("accepts registry fields, whole item lists, rows and row properties", () => {
    for (const key of ["buildings.total", "site.name", "businessPlan.risks", "businessPlan.risks.0", "businessPlan.risks.3.title"]) {
      expect(isPatchKey(key), key).toBe(true)
    }
  })

  it("rejects system values, row ids, provenance, unknown and unsafe paths", () => {
    for (const key of ["meta.id", "meta.schemaVersion", "businessPlan.risks.0.id", "provenance.ai", "buildings.shares", "x", "__proto__.a", ""]) {
      expect(isPatchKey(key), key).toBe(false)
    }
  })
})

describe("matchItemPath", () => {
  const match = (path: string) => matchItemPath(path, parsePath(path)!)

  it("knows the registry's item lists", () => {
    expect(ITEM_LISTS.map((list) => list.id)).toContain("businessPlan.risks")
  })

  it("matches rows and properties, and marks row ids read-only", () => {
    expect(match("businessPlan.risks.2")).toMatchObject({ kind: "item", index: 2, property: null })
    expect(match("businessPlan.risks.0.validation")).toMatchObject({ kind: "item", index: 0, property: "validation" })
    expect(match("businessPlan.risks.0.id")).toEqual({ kind: "read-only" })
    expect(match("businessPlan.risks.first.title")).toEqual({ kind: "unknown-field" })
    expect(match("businessPlan.risks.0.title.x")).toEqual({ kind: "unknown-field" })
  })

  it("returns null outside item lists", () => {
    expect(match("buildings.total")).toBeNull()
  })
})
