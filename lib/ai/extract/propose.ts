import type { Project } from "@/lib/project"
import { buildPatch } from "./build-patch"
import type { FieldCatalogue } from "./field-catalogue"
import type { Texts } from "./field-label"
import { mergeValues, type Conflict } from "./merge"
import type { ExtractionOutput } from "./output-schema"
import { normalizeValues, type UnclearValue } from "./to-patch"
import { validateProposal, type ValidatedProposal } from "./validate"

/** One model output, with the document it read when there was exactly one. */
export interface ExtractionRun {
  output: ExtractionOutput
  file?: string
}

/** Everything the review shows: what applies, what fails, what conflicts, what is unclear. */
export interface Proposal extends ValidatedProposal {
  conflicts: Conflict[]
  unclear: UnclearValue[]
  /** Topics the model itself could not settle. */
  notes: ExtractionOutput["unclear"]
}

export interface ProposalOptions {
  /** Catalogue in English, so option labels match when the UI language is German. */
  fallback?: FieldCatalogue
  /** Ids for new list rows (tests pass a counter). */
  newId?: () => string
}

/**
 * From model outputs to a reviewed proposal (PLAN-AGENT-03 step 4): normalize each value for its
 * field, merge across outputs (conflicts listed, never resolved silently), build the patch on top of
 * the current project, and dry-run it through `applyPatch`. Applying is up to the agent: in the app
 * only after the user confirms (`store.applyProposal`).
 */
export function buildProposal(runs: readonly ExtractionRun[], project: Project, catalogue: FieldCatalogue, texts: Texts, options: ProposalOptions = {}): Proposal {
  const unclear: UnclearValue[] = []
  const groups = runs.map(({ output, file }) => {
    const normalized = normalizeValues(output.values, catalogue, options.fallback)
    const withFile = <T extends { source: { file?: string } }>(value: T): T => (file && !value.source.file ? { ...value, source: { ...value.source, file } } : value)
    unclear.push(...normalized.unclear.map(withFile))
    return normalized.values.map(withFile)
  })
  const { values, conflicts } = mergeValues(groups)
  const validated = validateProposal(project, buildPatch(values, project, options.newId), texts)
  return { ...validated, conflicts, unclear, notes: runs.flatMap(({ output }) => output.unclear) }
}
