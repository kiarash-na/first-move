import type { AiSource, PatchProvenance, ProjectPatch } from "@/lib/project"

/** The `applyPatch` provenance option for values an agent proposed and the user confirmed. */
export function aiProvenance(by: AiSource, model: string, file?: string): PatchProvenance {
  return { by, model, ...(file && { file }) }
}

/** One patch key of a proposal and the documents its value was read from. */
export interface SourcedValue {
  key: string
  value: unknown
  files: readonly string[]
}

/**
 * Splits a confirmed proposal into one patch per source (PLAN-AGENT-03 step 6): `applyPatch`
 * takes one provenance per call, and each value should name the document it came from. A value
 * read from several documents names all of them; one from no document (a chat message) none.
 */
export function patchesBySource(values: readonly SourcedValue[], by: AiSource, model: string): { patch: ProjectPatch; provenance: PatchProvenance }[] {
  const groups = new Map<string, Record<string, unknown>>()
  for (const { key, value, files } of values) {
    const file = [...new Set(files)].join(", ")
    groups.set(file, { ...groups.get(file), [key]: value })
  }
  return [...groups].map(([file, patch]) => ({ patch, provenance: aiProvenance(by, model, file || undefined) }))
}
