/**
 * Go-live switch of the AI features (PLAN-DASH-12, D-42; D-82). The in-app assistant (A05) and the
 * email agent (A07) are built: while this is `true` the dashboard shows the assistant, the docs
 * list the AI pages and the AI page says the features are available. Flipping it back hides them
 * again without a copy change.
 */
export const AI_FEATURES_LIVE = true

/**
 * The AI Plan Score (PLAN-AI-SCORE-00) is available: an optional AI opinion on the Business Plan,
 * run with the user's own Vercel AI Gateway key. The AI page, the Privacy Policy and the Cookie
 * Policy describe it as available while this is `true`.
 */
export const AI_PLAN_SCORE_LIVE = true

/** Which status line the AI page shows: nothing live, only the AI Plan Score, or all AI features. */
export type AiStatus = "planned" | "score" | "live"

export function aiStatus(features: boolean, score: boolean): AiStatus {
  if (features) return "live"
  return score ? "score" : "planned"
}

/** An AI provider the user can connect with their own API key (bring-your-own-key, D-42). */
export interface AiProvider {
  name: string
  /** Where the provider processes requests, as stated in its terms. */
  region: string
  url: string
}

/**
 * Listed on the AI page while the features are live: the two services a user can hand their
 * own key to. Both pass the request on to the provider of the chosen model. The AI Plan Score
 * and the assistant take either key: OpenRouter by default, the Gateway second (owner,
 * 2026-10-25); on OpenRouter the score's decisions go through the Jev Router adapter.
 */
export const AI_PROVIDERS: readonly AiProvider[] = [
  { name: "Vercel AI Gateway", region: "Vercel Inc., USA; the request goes on to the provider of the chosen model", url: "https://vercel.com/legal/terms" },
  { name: "OpenRouter", region: "OpenRouter Inc., USA; the request goes on to the provider of the chosen model", url: "https://openrouter.ai/terms" },
]
