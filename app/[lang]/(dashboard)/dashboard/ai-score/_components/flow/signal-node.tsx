"use client"

import { GaugeIcon } from "lucide-react"

import { formatNumber, formatQuantity } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { DetailList } from "./detail-list"
import type { SignalView } from "./flow-model"
import { FlowNodeButton } from "./flow-node-button"

/**
 * Turn 0's Quick Check signal: its verdict and the figures the plan's technical claims are read
 * against. Deterministic, never computed by the AI (D-27); without a complete Quick Check Jev
 * reads the plan alone.
 */
export function SignalNode({ signal }: { signal: SignalView | null }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score").flow
  const levels = useDictionary("quick-check").results.levels
  const density = signal ? formatQuantity(signal.heatDensityMwhPerM, "MWh/m", lang, { maximumFractionDigits: 2 }) : null
  const ratio = signal?.economicRatio == null ? null : formatNumber(signal.economicRatio, lang, { maximumFractionDigits: 2 })

  return (
    <FlowNodeButton
      nodeKey="signal:quick-check"
      kind={copy.detail.kinds.signal}
      title={copy.detail.kinds.signal}
      data={{ level: signal?.level ?? "none" }}
      className={signal ? undefined : "border-dashed"}
      trigger={
        <span className="flex min-w-0 flex-1 items-start gap-2.5 px-2.5 py-2">
          <GaugeIcon className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.8} aria-hidden="true" />
          <span className="flex min-w-0 flex-col gap-1">
            {signal ? (
              <>
                <span className="text-sm leading-snug text-foreground">{levels[signal.level].label}</span>
                <span className="font-mono text-xs tracking-[0.04em] text-text-secondary">{interpolate(copy.node.heatDensity, { value: density! })}</span>
              </>
            ) : (
              <span className="text-sm leading-snug text-text-secondary">{copy.node.signalNone}</span>
            )}
          </span>
        </span>
      }
    >
      {signal ? (
        <>
          <p>{levels[signal.level].description}</p>
          <DetailList
            rows={[
              [copy.detail.heatDensity, density],
              [copy.detail.economicRatio, ratio],
            ]}
          />
          <p className="text-text-secondary">{copy.detail.signalNote}</p>
        </>
      ) : (
        <p>{copy.node.signalNone}</p>
      )}
    </FlowNodeButton>
  )
}
