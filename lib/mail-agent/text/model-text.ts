import "server-only"
import { findLeak } from "@/lib/ai/prompts/canary"
import { restrictLinks } from "@/lib/ai/text/links"
import { sanitizeText } from "@/lib/ai/text/sanitize"
import { OPERATOR } from "@/lib/legal/operator"

/** Any email address; only ours may appear in text a model wrote. */
const ADDRESS = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi

export interface ModelTextPolicy {
  /** The site's origin: the only place a link may point. */
  siteUrl: string
  canary: string
  /** The private instructions, to catch an output that repeats them. */
  instructions: string
  maxChars: number
}

/**
 * Whether text a model wrote may not reach an email at all: it leaks the canary or the
 * instructions, or names an email address other than the agent's and human@.
 */
export function forbiddenModelText(text: string, policy: Pick<ModelTextPolicy, "canary" | "instructions">): boolean {
  const clean = sanitizeText(text).text
  if (findLeak(clean, { canary: policy.canary, instructions: policy.instructions })) return true
  const ours = new Set([OPERATOR.emailAgent, OPERATOR.emailHuman].map((address) => address.toLowerCase()))
  return (clean.match(ADDRESS) ?? []).some((address) => !ours.has(address.toLowerCase()))
}

/**
 * Text a model wrote, made safe to put in an email (PLAN-AGENT-07 step 4): sanitized, links
 * only to the site (others defanged), cut to length; null when it is forbidden (the canary, the
 * instructions, an address other than ours), so a reply can never carry an injected address or
 * the prompt.
 */
export function cleanModelText(text: string, policy: ModelTextPolicy): string | null {
  const clean = sanitizeText(text).text.trim()
  if (!clean || forbiddenModelText(clean, policy)) return null
  const linked = restrictLinks(clean, { origins: [new URL(policy.siteUrl).origin] })
  const chars = [...linked]
  return chars.length > policy.maxChars ? `${chars.slice(0, policy.maxChars - 1).join("").trimEnd()}…` : linked
}
