// @vitest-environment node
import { describe, expect, it } from "vitest"
import { updateMarks, writtenLeaves } from "./provenance-marks"
import type { AiMark } from "./schema/provenance"

const mark: AiMark = { at: "2026-10-24T08:00:00.000Z", by: "email", model: "claude-haiku-5-5" }

describe("writtenLeaves", () => {
  it("returns a filled single value, and nothing for an empty one", () => {
    expect(writtenLeaves({ key: "buildings.total", value: 3, shape: "value" })).toEqual(["buildings.total"])
    expect(writtenLeaves({ key: "sources.pv", value: false, shape: "value" })).toEqual(["sources.pv"])
    for (const value of [null, "", []]) expect(writtenLeaves({ key: "site.name", value, shape: "value" })).toEqual([])
  })

  it("expands a row and a list into their filled properties", () => {
    const properties = ["title", "validation"]
    expect(writtenLeaves({ key: "l.0", value: { id: "a", title: "T", validation: "" }, shape: "row", properties })).toEqual(["l.0.title"])
    expect(writtenLeaves({ key: "l", value: [{ title: "A" }, { title: "B", validation: "V" }], shape: "list", properties })).toEqual([
      "l.0.title",
      "l.1.title",
      "l.1.validation",
    ])
    expect(writtenLeaves({ key: "l", value: "not a list", shape: "list", properties })).toEqual([])
  })
})

describe("updateMarks", () => {
  it("replaces marks at and below each written key, and never touches the input", () => {
    const before = { "l.0.title": mark, "l.1.title": mark, "buildings.total": mark, "buildings.totalX": mark }
    const after = updateMarks(before, [{ key: "buildings.total", value: 4, shape: "value" }, { key: "l", value: [], shape: "list", properties: ["title"] }], null)
    expect(Object.keys(after)).toEqual(["buildings.totalX"])
    expect(Object.keys(before)).toHaveLength(4)
  })

  it("adds the mark for each written leaf", () => {
    const after = updateMarks({}, [{ key: "buildings.total", value: 4, shape: "value" }], mark)
    expect(after).toEqual({ "buildings.total": mark })
  })
})
