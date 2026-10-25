"use client"

import { GaugeIcon } from "lucide-react"

import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { AiScore } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { VerdictBadge } from "../../../_components/verdict-badge"

/**
 * The Quick Check figures the run used (turn 0): entered as a fixed signal, never computed by the
 * AI (D-27). Cyan, the Quick Check's colour. Without a complete Quick Check it says so.
 */
export function QuickCheckSignal({ signal }: { signal: AiScore["quickCheck"] }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score").results.signal

  return (
    <div data-slot="quick-check-signal" className="flex flex-col gap-3 border border-l-2 border-l-primary px-4 py-3">
      <p className="flex items-center gap-2 font-mono text-xs tracking-[0.075em] text-primary uppercase">
        <GaugeIcon className="size-4" strokeWidth={1.6} aria-hidden="true" />
        {copy.title}
      </p>
      {signal ? (
        <>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">{copy.verdict}</dt>
            <dd>
              <VerdictBadge level={signal.level} className="whitespace-normal" />
            </dd>
            <dt className="text-muted-foreground">{copy.heatDensity}</dt>
            <dd className="font-mono tabular-nums">{interpolate(copy.heatDensityValue, { value: formatNumber(signal.heatDensityMwhPerM, lang, { maximumFractionDigits: 2 }) })}</dd>
            {signal.economicRatio !== null && (
              <>
                <dt className="text-muted-foreground">{copy.economicRatio}</dt>
                <dd className="font-mono tabular-nums">{interpolate(copy.economicRatioValue, { value: formatNumber(signal.economicRatio, lang, { maximumFractionDigits: 2 }) })}</dd>
              </>
            )}
          </dl>
          <p className="text-xs leading-snug text-muted-foreground">{copy.note}</p>
        </>
      ) : (
        <p className="text-sm leading-snug text-muted-foreground">{copy.none}</p>
      )}
    </div>
  )
}
