/**
 * The providers the in-app assistant can use with the user's own key (O7): OpenRouter by default,
 * the Vercel AI Gateway second (owner, 2026-10-25). The Gateway key is the AI Plan Score's.
 */
export const PROVIDERS = ["openrouter", "gateway"] as const
export type Provider = (typeof PROVIDERS)[number]

export function isProvider(value: unknown): value is Provider {
  return typeof value === "string" && (PROVIDERS as readonly string[]).includes(value)
}
