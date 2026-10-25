import type { GatewayErrorCode } from "@/lib/assistant/gateway/errors"

/**
 * What the saved result can ask the page to do with AI (PLAN-AI-SCORE-00 step 6). The page owns
 * the Gateway key, the chosen text model and the requests; the result views only call these.
 */
export interface ResultActions {
  /** A key is set, a text model is chosen and no run is in flight, so the report and the suggestions can be written. */
  canUseAi: boolean
  /** A run is in flight: its score replaces the saved one, so no text request starts until it ends. */
  running: boolean
  /** The text request that is running, if any. */
  busy: "report" | "suggestions" | null
  /** The error of the last text request, if it failed. */
  error: GatewayErrorCode | null
  /** Writes the report again, in the page language and with the chosen model. */
  rewriteReport: () => void
  /** On-demand suggestions (D-77) for these judgement or gate ids, or for every weak one. */
  suggest: (keys?: readonly string[]) => void
  /** Deletes the saved score from the project. */
  remove: () => void
}
