"use client"

import { LightbulbIcon, LoaderCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDictionary } from "../../../_components/i18n-provider"
import type { ResultActions } from "../types"

/**
 * Asks for suggestions on demand (D-77): `actions.suggest(keys)`, or for every weak part without
 * keys. Disabled while a text request runs, and with a hint while no key or text model is ready.
 */
export function SuggestButton({
  actions,
  keys,
  label,
  name,
  variant = "secondary",
  className,
}: {
  actions: ResultActions
  keys?: readonly string[]
  label: string
  /** Accessible name when the visible label is short ("Suggest improvements for Key pain point"). */
  name?: string
  variant?: "secondary" | "hot"
  className?: string
}) {
  const copy = useDictionary("ai-score").results
  const busy = actions.busy === "suggestions"

  return (
    <div data-slot="suggest-button" className={cn("flex flex-col items-start gap-1.5", className)}>
      <Button
        type="button"
        variant={variant}
        size="sm"
        className="h-auto min-h-11 py-2 text-left leading-tight whitespace-normal"
        aria-label={name}
        aria-busy={busy || undefined}
        disabled={!actions.canUseAi || actions.busy !== null}
        onClick={() => actions.suggest(keys)}
      >
        {busy ? <LoaderCircleIcon className="animate-spin" strokeWidth={1.6} aria-hidden="true" /> : <LightbulbIcon strokeWidth={1.6} aria-hidden="true" />}
        {busy ? copy.suggestions.writing : label}
      </Button>
      {!actions.canUseAi && <p className="text-xs leading-snug text-muted-foreground">{copy.needsAi}</p>}
    </div>
  )
}
