/**
 * Switch for the AI transparency page (PLAN-DASH-12, D-42). The two AI functions (answering
 * questions about project data, filling fields from documents) are not built: while this is
 * `false` the page says so. Setting it to `true` is part of the go-live checklist in
 * `docs/90_work/notes/2026-10-24_phase-12_legal.md`, not a copy edit.
 */
export const AI_FEATURES_LIVE = false

/** An AI provider the user can connect with their own API key (bring-your-own-key, D-42). */
export interface AiProvider {
  name: string
  /** Where the provider processes requests, as stated in its terms. */
  region: string
  url: string
}

/** Listed on the AI page once the features are live. Empty until then. */
export const AI_PROVIDERS: readonly AiProvider[] = []
