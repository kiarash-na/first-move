// @vitest-environment node
import { describe, expect, it } from "vitest"
import { projectSchema } from "@/lib/project"
import { edited, testId, testProject } from "./projects"

describe("test projects (test helper)", () => {
  it("builds valid projects with stable ids and times", () => {
    const project = testProject(3, { "buildings.total": 12 })
    expect(projectSchema.safeParse(project).success).toBe(true)
    expect(project.meta.id).toBe(testId(3))
    expect(project.buildings.total).toBe(12)
  })

  it("edits with a new updatedAt and rejects invalid patches", () => {
    const later = edited(testProject(1), { "meta.name": "Later" }, "2026-10-24T09:00:00.000Z")
    expect(later.meta.updatedAt).toBe("2026-10-24T09:00:00.000Z")
    expect(() => testProject(1, { "buildings.total": -1 })).toThrow()
  })
})
