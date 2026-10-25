"use client"

import { useDictionary } from "../../../_components/i18n-provider"
import type { ResultActions } from "../types"

/**
 * Why the report and suggestion buttons are disabled, when they are: a run is in flight (its
 * score replaces the saved one), or no key or text model is ready. Nothing while AI can write.
 */
export function AiHint({ actions }: { actions: Pick<ResultActions, "canUseAi" | "running"> }) {
  const copy = useDictionary("ai-score").results
  if (actions.canUseAi) return null
  return (
    <p data-slot="ai-hint" data-reason={actions.running ? "running" : "setup"} className="text-xs leading-snug text-muted-foreground">
      {actions.running ? copy.runInProgress : copy.needsAi}
    </p>
  )
}
