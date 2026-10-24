import { emptyValue } from "./empty-value"
import { projectSchema, type Project } from "./schema/project"
import type { ProjectModules } from "./schema/meta"
import { METHODOLOGY_VERSION, SCHEMA_VERSION } from "./versions"

export interface CreateProjectOptions {
  /** The modules to turn on (start screen tiles: Quick Check, Business Plan, both). At least one. */
  modules: Partial<ProjectModules>
  name?: string
  /** Example the project is copied from (D-04). */
  exampleId?: string | null
  /** Injected for tests; defaults to `crypto.randomUUID()`. */
  id?: string
  /** Injected for tests; defaults to now. */
  now?: Date
}

/** Sections whose empty value comes straight from the schema. */
const SECTIONS = ["site", "buildings", "sources", "quickCheck", "businessPlan"] as const

/**
 * An empty, valid project for the chosen modules (D-01). Every section exists, whichever
 * modules are on: inputs are null, text is empty, the share grid starts empty (D-31), and no
 * value is marked as AI-proposed.
 */
export function createProject({ modules, name = "", exampleId = null, id, now = new Date() }: CreateProjectOptions): Project {
  const selection = { quickCheck: modules.quickCheck ?? false, businessPlan: modules.businessPlan ?? false }
  if (!selection.quickCheck && !selection.businessPlan) {
    throw new Error("A project needs at least one module")
  }
  const timestamp = now.toISOString()
  const sections = Object.fromEntries(SECTIONS.map((key) => [key, emptyValue(projectSchema.shape[key])]))
  return projectSchema.parse({
    meta: {
      id: id ?? crypto.randomUUID(),
      name,
      createdAt: timestamp,
      updatedAt: timestamp,
      schemaVersion: SCHEMA_VERSION,
      methodologyVersion: METHODOLOGY_VERSION,
      modules: selection,
      exampleId,
    },
    ...sections,
    provenance: { ai: {} },
  })
}
