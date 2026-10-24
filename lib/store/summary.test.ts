// @vitest-environment node
import { describe, expect, it } from "vitest"
import { edited, testId, testProject } from "@/lib/storage/test-utils/projects"
import { removeSummary, sortSummaries, toSummary, upsertSummary } from "./summary"

describe("project summaries", () => {
  it("take the list fields from meta", () => {
    expect(toSummary(testProject(1))).toEqual({
      id: testId(1),
      name: "Project 1",
      createdAt: "2026-10-24T08:00:00.000Z",
      updatedAt: "2026-10-24T08:00:00.000Z",
      modules: { quickCheck: true, businessPlan: true },
      exampleId: null,
    })
  })

  it("sort by last change, newest first, stable on ties", () => {
    const a = toSummary(testProject(1))
    const b = toSummary(edited(testProject(2), { "meta.name": "B" }, "2026-10-24T09:00:00.000Z"))
    const c = toSummary(testProject(3))
    expect(sortSummaries([c, a, b]).map((entry) => entry.id)).toEqual([testId(2), testId(1), testId(3)])
  })

  it("upsert and remove, keeping the same list when nothing changes", () => {
    const list = [toSummary(testProject(1))]
    expect(upsertSummary(list, toSummary(testProject(1)))).toBe(list)
    const renamed = upsertSummary(list, toSummary(edited(testProject(1), { "meta.name": "New" }, "2026-10-24T09:00:00.000Z")))
    expect(renamed).not.toBe(list)
    expect(renamed.map((entry) => entry.name)).toEqual(["New"])
    const added = upsertSummary(renamed, toSummary(testProject(2)))
    expect(added).toHaveLength(2)
    expect(removeSummary(added, testId(2))).toHaveLength(1)
    expect(removeSummary(list, "missing")).toBe(list)
  })
})
