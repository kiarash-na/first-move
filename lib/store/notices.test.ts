// @vitest-environment node
import { describe, expect, it } from "vitest"
import { addNotice, removeNotice, removeNoticesOf } from "./notices"

describe("notices", () => {
  it("replace a notice of the same kind and project", () => {
    let list = addNotice([], { kind: "conflict", projectId: "p" }, 1)
    list = addNotice(list, { kind: "conflict", projectId: "p" }, 2)
    list = addNotice(list, { kind: "conflict", projectId: "q" }, 3)
    list = addNotice(list, { kind: "recovered", count: 2 }, 4)
    expect(list).toEqual([
      { id: 2, kind: "conflict", projectId: "p", count: null },
      { id: 3, kind: "conflict", projectId: "q", count: null },
      { id: 4, kind: "recovered", projectId: null, count: 2 },
    ])
  })

  it("are removed by id or by project (and kind)", () => {
    const list = [
      { id: 1, kind: "conflict" as const, projectId: "p", count: null },
      { id: 2, kind: "export-reminder" as const, projectId: "p", count: null },
      { id: 3, kind: "conflict" as const, projectId: "q", count: null },
    ]
    expect(removeNotice(list, 2).map((entry) => entry.id)).toEqual([1, 3])
    expect(removeNotice(list, 9)).toBe(list)
    expect(removeNoticesOf(list, "p", "export-reminder").map((entry) => entry.id)).toEqual([1, 3])
    expect(removeNoticesOf(list, "p").map((entry) => entry.id)).toEqual([3])
    expect(removeNoticesOf(list, "z")).toBe(list)
  })
})
