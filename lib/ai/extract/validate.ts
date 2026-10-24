import { interpolate } from "@/lib/i18n/interpolate"
import { lookup } from "@/lib/i18n/lookup"
import {
  applyPatch,
  fieldsOf,
  FIELD_GROUPS,
  groupRuleStatus,
  type GroupRule,
  type PatchError,
  type PatchErrorCode,
  type Project,
  type ProjectPatch,
} from "@/lib/project"
import type { ProposalEntry } from "./build-patch"
import { textOf, type Texts } from "./field-label"

export interface InvalidEntry extends ProposalEntry {
  code: PatchErrorCode
  params?: PatchError["params"]
  /** The UI's validation text (`shell` dictionary), or the English detail when it is not loaded. */
  message: string
}

/** A group whose rule the proposal leaves unmet (shares not adding up to 100, R-03): incomplete, not an error. */
export interface IncompleteGroup {
  id: string
  label: string
  rule: GroupRule
  value: number
}

export interface ValidatedProposal {
  /** The entries that apply cleanly, as one patch. */
  patch: ProjectPatch
  valid: ProposalEntry[]
  invalid: InvalidEntry[]
  incomplete: IncompleteGroup[]
}

function message(error: PatchError, texts: Texts): string {
  const template = lookup(texts.shell, `validation.${error.code}`)
  if (!template) return error.message
  const params = Object.fromEntries(Object.entries(error.params ?? {}).map(([key, value]) => [key, Array.isArray(value) ? value.join(", ") : value]))
  return interpolate(template, params as Record<string, string | number>)
}

/**
 * Dry-runs a proposal through `applyPatch` on the current project (PLAN-AGENT-03 step 4). Nothing
 * is stored: the result says which entries apply, which fail (with the code and the UI's
 * message), and which group rules the applied entries leave unmet.
 */
export function validateProposal(project: Project, entries: readonly ProposalEntry[], texts: Texts): ValidatedProposal {
  const result = applyPatch(project, Object.fromEntries(entries.map((entry) => [entry.key, entry.value])))
  const applied = new Set(result.applied)
  const valid = entries.filter((entry) => applied.has(entry.key))
  const invalid = entries
    .filter((entry) => !applied.has(entry.key))
    .map((entry): InvalidEntry => {
      const error = result.errors.find((candidate) => candidate.path === entry.key || candidate.path.startsWith(`${entry.key}.`)) ?? {
        path: entry.key,
        code: "invalid" as const,
        message: `${entry.key} was not applied`,
      }
      return { ...entry, code: error.code, ...(error.params && { params: error.params }), message: message(error, texts) }
    })
  const incomplete = FIELD_GROUPS.filter((group) => group.rule && fieldsOf({ group: group.id }).some((field) => applied.has(field.id))).flatMap(
    (group): IncompleteGroup[] => {
      const status = groupRuleStatus(result.project, group)
      return status.ok ? [] : [{ id: group.id, label: textOf(texts, group.text) ?? group.id, rule: group.rule!, value: status.value }]
    },
  )
  return { patch: Object.fromEntries(valid.map((entry) => [entry.key, entry.value])), valid, invalid, incomplete }
}
