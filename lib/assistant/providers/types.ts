/**
 * The providers the in-app assistant can use with the user's own key (O7): the Vercel AI
 * Gateway, with the same key as the AI Plan Score, and OpenRouter.
 */
export const PROVIDERS = ["gateway", "openrouter"] as const
export type Provider = (typeof PROVIDERS)[number]

export function isProvider(value: unknown): value is Provider {
  return typeof value === "string" && (PROVIDERS as readonly string[]).includes(value)
}
