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
 * Text a model wrote, made safe to put in an email (PLAN-AGENT-07 step 4): sanitized, links
 * only to the site (others defanged), cut to length; null when it leaks the canary or the
 * instructions, or names an email address other than the agent's and human@, so a reply can
 * never carry an injected address or the prompt.
 */
export function cleanModelText(text: string, policy: ModelTextPolicy): string | null {
  const clean = sanitizeText(text).text.trim()
  if (!clean) return null
  if (findLeak(clean, { canary: policy.canary, instructions: policy.instructions })) return null
  const ours = new Set([OPERATOR.emailAgent, OPERATOR.emailHuman].map((address) => address.toLowerCase()))
  if ((clean.match(ADDRESS) ?? []).some((address) => !ours.has(address.toLowerCase()))) return null
  const linked = restrictLinks(clean, { origins: [new URL(policy.siteUrl).origin] })
  const chars = [...linked]
  return chars.length > policy.maxChars ? `${chars.slice(0, policy.maxChars - 1).join("").trimEnd()}…` : linked
}
