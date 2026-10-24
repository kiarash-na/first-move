export const REDACTED = "[redacted]"

const mixed = (value: string) => /\d/.test(value) && /[a-z]/.test(value) && /[A-Z]/.test(value)
const hexLike = (value: string) => /\d/.test(value) && /[a-f]/i.test(value)
const tokenLike = (value: string) => /\d/.test(value) && /[A-Za-z]/.test(value)

function credential(match: string): string {
  const [scheme, token] = match.split(/\s+/)
  return tokenLike(token) ? `${scheme} ${REDACTED}` : match
}

/** Known key formats first, then generic long tokens (with a check that keeps long words). */
const PATTERNS: readonly [RegExp, (match: string) => string][] = [
  [/\bsk-ant-[A-Za-z0-9_-]{8,}/g, () => REDACTED],
  [/\bsk-or-[A-Za-z0-9_-]{8,}/g, () => REDACTED],
  [/\bsk-[A-Za-z0-9_-]{20,}/g, () => REDACTED],
  [/\bre_[A-Za-z0-9_]{8,}/g, () => REDACTED],
  [/\bvck_[A-Za-z0-9_-]{8,}/g, () => REDACTED],
  [/\bwhsec_[A-Za-z0-9+/=]{8,}/g, () => REDACTED],
  [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, () => REDACTED],
  [/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{8,}/gi, credential],
  [/\b[A-Fa-f0-9]{32,}\b/g, (match) => (hexLike(match) ? REDACTED : match)],
  [/[A-Za-z0-9+/_-]{40,}={0,2}/g, (match) => (mixed(match) ? REDACTED : match)],
]

/**
 * Masks secrets in text that could reach logs or prompts (PLAN-AGENT-03 step 1): Anthropic,
 * OpenRouter, OpenAI-style, Resend, Vercel AI Gateway and webhook keys, JWTs, bearer and basic
 * credentials, and long hex or base64 runs that look random (digits and both letter cases).
 */
export function redactSecrets(text: string): string {
  return PATTERNS.reduce((current, [pattern, replace]) => current.replace(pattern, replace), text)
}
