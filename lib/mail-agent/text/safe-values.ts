import "server-only"
import type { Proposal } from "@/lib/ai/extract/propose"
import { restrictLinks } from "@/lib/ai/text/links"
import { forbiddenModelText, type ModelTextPolicy } from "./model-text"

type ValuePolicy = Pick<ModelTextPolicy, "siteUrl" | "canary" | "instructions">

/** Every string in a value: the value itself, list entries, the properties of item rows. */
function stringsOf(value: unknown): string[] {
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.flatMap(stringsOf)
  if (value && typeof value === "object") return Object.values(value).flatMap(stringsOf)
  return []
}

/** The value with links elsewhere defanged in every string, its shape kept. */
function defang<T>(value: T, origins: readonly string[]): T {
  if (typeof value === "string") return restrictLinks(value, { origins }) as T
  if (Array.isArray(value)) return value.map((entry) => defang(entry, origins)) as T
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, defang(entry, origins)])) as T
  return value
}

/**
 * The extractor's values held to the rule for model text (PLAN-AGENT-07 step 4) before they reach
 * the draft, the reply and the project file: a value, or the file name it cites, that leaks the
 * canary or the instructions or names an address other than ours is withheld (its label is
 * returned, so the reply can say so); links elsewhere are defanged. Conflicting candidates, which
 * the reply also shows, follow the same rule.
 */
export function screenProposal(proposal: Proposal, policy: ValuePolicy): { proposal: Proposal; withheld: string[] } {
  const origins = [new URL(policy.siteUrl).origin]
  const forbidden = (strings: readonly string[]) => strings.some((text) => forbiddenModelText(text, policy))
  const withheld: string[] = []
  const valid = proposal.valid.flatMap((entry) => {
    if (!forbidden([...stringsOf(entry.value), ...entry.sources.flatMap((source) => source.file ?? [])])) return [{ ...entry, value: defang(entry.value, origins) }]
    withheld.push(entry.label)
    return []
  })
  const conflicts = proposal.conflicts.flatMap((conflict) => {
    if (!forbidden(conflict.candidates.flatMap((candidate) => stringsOf(candidate.value)))) {
      return [{ ...conflict, candidates: conflict.candidates.map((candidate) => ({ ...candidate, value: defang(candidate.value, origins) })) }]
    }
    withheld.push(conflict.label)
    return []
  })
  const patch = Object.fromEntries(valid.map((entry) => [entry.key, entry.value]))
  return { proposal: { ...proposal, valid, conflicts, patch }, withheld: [...new Set(withheld)] }
}
