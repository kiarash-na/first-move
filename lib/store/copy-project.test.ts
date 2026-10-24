// @vitest-environment node
import { describe, expect, it } from "vitest"
import { testId, testProject } from "@/lib/storage/test-utils/projects"
import { copyProject, touchProject } from "./copy-project"

const now = new Date("2026-10-24T12:00:00.000Z")

describe("copyProject", () => {
  it("keeps the inputs with a new id and new timestamps", () => {
    const source = testProject(1, { "buildings.total": 12 })
    const copy = copyProject(source, { id: testId(9), now })
    expect(copy.meta).toMatchObject({ id: testId(9), name: "Project 1", createdAt: now.toISOString(), updatedAt: now.toISOString() })
    expect(copy.buildings).toEqual(source.buildings)
    expect(source.meta.id).toBe(testId(1))
  })

  it("takes a new name, cut to the name limit", () => {
    expect(copyProject(testProject(1), { id: testId(9), now, name: "x".repeat(200) }).meta.name).toHaveLength(120)
  })
})

describe("touchProject", () => {
  it("only moves updatedAt", () => {
    const project = testProject(1)
    const touched = touchProject(project, now)
    expect(touched).toEqual({ ...project, meta: { ...project.meta, updatedAt: now.toISOString() } })
  })
})
