import { applyPatch, createProject, type Project, type ProjectPatch } from "@/lib/project"

/** The Quick Check answers a test sender gives: 42 buildings on 3.5 ha, a mixed stock, two sources. */
export const QUICK_CHECK_ANSWERS: ProjectPatch = {
  "meta.name": "Sonnenhof",
  "buildings.total": 42,
  "buildings.areaM2": 35_000,
  "buildings.shares.residential.1961_1990": 60,
  "buildings.shares.residential.2011_today": 30,
  "buildings.shares.category_a.1991_2010": 10,
  "sources.potentials.ground_water": "high",
  "sources.potentials.ambient_air": "medium",
}

/** A draft project with the given values applied (a test fails loudly on a value that does not apply). */
export function projectWith(patch: ProjectPatch, base: Project = createProject({ modules: { quickCheck: true }, now: new Date(Date.UTC(2026, 9, 25)) })): Project {
  const result = applyPatch(base, patch)
  if (!result.ok) throw new Error(`Test patch did not apply: ${JSON.stringify(result.errors)}`)
  return result.project
}
