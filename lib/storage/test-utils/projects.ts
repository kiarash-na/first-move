import { applyPatch, createProject, type Project, type ProjectPatch } from "@/lib/project"

/** Test helper: a stable project id (a valid UUID) for `n`. */
export const testId = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`

/** Test helper: a valid project with a fixed id and time, optionally patched. */
export function testProject(n = 1, patch: ProjectPatch = {}, at = "2026-10-24T08:00:00.000Z"): Project {
  const project = createProject({ modules: { quickCheck: true, businessPlan: true }, id: testId(n), name: `Project ${n}`, now: new Date(at) })
  if (Object.keys(patch).length === 0) return project
  const result = applyPatch(project, patch, { atomic: true, now: new Date(at) })
  if (!result.ok) throw new Error(JSON.stringify(result.errors))
  return result.project
}

/** Test helper: the same project changed at a later time (a new `updatedAt`). */
export function edited(project: Project, patch: ProjectPatch, at: string): Project {
  const result = applyPatch(project, patch, { atomic: true, now: new Date(at) })
  if (!result.ok) throw new Error(JSON.stringify(result.errors))
  return result.project
}
