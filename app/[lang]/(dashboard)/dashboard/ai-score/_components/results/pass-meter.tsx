"use client"

import { GATE_FAIL, GATE_PASS } from "@/lib/ai/plan-score/gates"
import { formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { BulletBar } from "../../../_components/charts/bullet-bar"

/**
 * The probability that a check passes as a bullet bar: grey bands for fail (up to GATE_FAIL),
 * unclear and pass (from GATE_PASS), the probability as the orange measure and the pass threshold
 * as the target. The value is text above it; the bar is decorative.
 */
export function PassMeter({ probability, className }: { probability: number; className?: string }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score").results.checks
  const value = formatPercent(probability, lang)

  return (
    <div data-slot="pass-meter" data-probability={probability} className={cn("flex flex-col gap-1", className)}>
      <span className="font-mono text-xs tabular-nums">
        <span className="sr-only">
          {interpolate(copy.meterLabel, { value, pass: formatPercent(GATE_PASS, lang), fail: formatPercent(GATE_FAIL, lang) })}
        </span>
        <span aria-hidden="true">{interpolate(copy.passProbability, { value })}</span>
      </span>
      <BulletBar
        value={probability}
        max={1}
        target={GATE_PASS}
        tone="hot"
        ticks={[
          { at: GATE_FAIL, label: formatPercent(GATE_FAIL, lang) },
          { at: GATE_PASS, label: formatPercent(GATE_PASS, lang) },
        ]}
      />
    </div>
  )
}
