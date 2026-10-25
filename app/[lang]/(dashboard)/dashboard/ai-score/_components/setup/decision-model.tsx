"use client"

import { CpuIcon, ShieldCheckIcon } from "lucide-react"

import { DECISION_MODEL_ID } from "@/lib/ai/plan-score/run"
import type { Provider } from "@/lib/assistant/providers/types"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary } from "../../../_components/i18n-provider"

/** The version part of the pinned id: `typesafe-ai/jev-1.14.0` → `1.14.0`. */
export const DECISION_MODEL_VERSION = /(\d+\.\d+\.\d+)$/.exec(DECISION_MODEL_ID)?.[1] ?? DECISION_MODEL_ID

/**
 * The decision model of the chosen provider (D-71): on the Gateway Jev, pinned so scores stay
 * comparable; on OpenRouter the Jev Router, which routes each request, so those scores are not
 * comparable with Gateway runs (owner, 2026-10-25).
 */
export function DecisionModel({ provider }: { provider: Provider }) {
  const copy = useDictionary("ai-score").setup.decision
  const text = copy[provider]
  return (
    <div data-slot="decision-model" className="flex flex-col gap-2">
      <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{copy.label}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <CpuIcon className="size-5 shrink-0 text-hot" strokeWidth={1.6} aria-hidden="true" />
        <span className="text-[17px] font-[480]">{text.name}</span>
        <span className="font-mono text-xs tracking-[0.06em] text-text-secondary uppercase">{interpolate(text.version, { version: DECISION_MODEL_VERSION })}</span>
      </div>
      <p className="max-w-[72ch] text-sm leading-relaxed text-text-secondary">{text.note}</p>
      <p className="inline-flex items-center gap-2 text-sm text-text-secondary">
        <ShieldCheckIcon className="size-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
        {text.zdr}
      </p>
    </div>
  )
}
