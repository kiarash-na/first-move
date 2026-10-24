import { vi } from "vitest"
import { applyPatch, type Project, type ProjectPatch } from "@/lib/project"
import { localizeExample, getExample } from "@/lib/examples"
import { createProject } from "@/lib/project"
import { fakeStore } from "./fake-store"

/**
 * Tests only: a ready store with one open project whose `patch` runs the real `applyPatch`
 * (D-05), so input components can be tested end to end without IndexedDB.
 */
export function projectStore(project: Project) {
  const fake = fakeStore({ active: project, activeId: project.meta.id })
  const patch = vi.fn((input: ProjectPatch) => {
    const active = fake.store.getState().active
    if (!active) return null
    const result = applyPatch(active, input)
    if (result.project !== active) fake.set({ active: result.project })
    return result
  })
  Object.assign(fake.spies, { patch })
  return { store: fake.store, patch, set: fake.set, current: () => fake.store.getState().active! }
}

/** Tests only: an example project (EN) as the app opens it. */
export function exampleProject(id: string): Project {
  return localizeExample(getExample(id)!, "en")
}

/** Tests only: an empty Quick Check project. */
export function emptyProject(): Project {
  return createProject({ modules: { quickCheck: true }, now: new Date("2026-10-24T08:00:00Z") })
}
