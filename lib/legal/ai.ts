/**
 * Switch for the AI transparency page (PLAN-DASH-12, D-42). The two AI functions (answering
 * questions about project data, filling fields from documents) are not built: while this is
 * `false` the page says so. Setting it to `true` is part of the go-live checklist in
 * `docs/90_work/notes/2026-10-24_phase-12_legal.md`, not a copy edit.
 */
export const AI_FEATURES_LIVE = false

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

/** Listed on the AI page once the features are live. Empty until then. */
export const AI_PROVIDERS: readonly AiProvider[] = []
