"use client"

import { FlameIcon, SnowflakeIcon } from "lucide-react"
import { indicatorEffect } from "@/lib/dashboard/indicator-effect"
import { formatEnergy, formatPercent } from "@/lib/i18n/format"
import { explainResult, type Demand, type QuickCheckComplete } from "@/lib/quick-check"
import { cn } from "@/lib/utils"
import { CalcInfo } from "../../../_components/how-we-calculate"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { EffectMark } from "../../../_components/effect-mark"
import { CoverageScale } from "./coverage-scale"

const KEYS = {
  heating: { coverage: "heatingCoverage", supply: "heatingSupplyKwh", demand: "heatingDemandKwh", driver: "heating_coverage", manual: "manualHeatingDemand" },
  cooling: { coverage: "coolingCoverage", supply: "coolingSupplyKwh", demand: "coolingDemandKwh", driver: "cooling_coverage", manual: "manualCoolingDemand" },
} as const

/**
 * The coverage of one demand (QCT-KF-03/04): value, TBL-7 class and its meaning, supply against
 * demand, and the info popovers of every number (D-33). "Not relevant" when the demand is 0.
 */
export function CoverageCard({ demand, result }: { demand: Demand; result: QuickCheckComplete }) {
  const lang = useLocale()
  const copy = useDictionary("quick-check")
  const ui = copy.ui.results.coverage
  const keys = KEYS[demand]
  const { values, flags } = result
  const value = values[keys.coverage]
  const coverageClass = result.classes[keys.coverage]
  const effect = indicatorEffect(result.drivers, keys.driver)
  const classCopy = coverageClass ? copy.results.classes.coverage[coverageClass] : copy.results.classes.notRelevant
  const name = copy.results.demands[demand].label
  const Icon = demand === "heating" ? FlameIcon : SnowflakeIcon

  return (
    <article data-slot="coverage-card" data-demand={demand} aria-labelledby={`coverage-${demand}`} className="flex flex-col gap-4 bg-background p-5 sm:p-6">
      <header className="flex items-start justify-between gap-3">
        <h3 id={`coverage-${demand}`} className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">
          <Icon className={cn("size-4", demand === "heating" ? "text-hot" : "text-primary")} strokeWidth={1.6} aria-hidden="true" />
          {name}
        </h3>
        <CalcInfo source={explainResult(keys.coverage, flags)} label={`${ui.title} · ${name}`} className="-m-2.5" />
      </header>
      <div className="flex items-end justify-between gap-4">
        <p className="font-mono text-[clamp(30px,3.2vw,40px)] leading-none tracking-[-0.03em] tabular-nums">
          {formatPercent(value, lang)}
        </p>
        <span className="inline-flex items-center gap-2 pb-0.5 text-right text-sm leading-tight">
          {classCopy.label}
          <EffectMark effect={effect} />
        </span>
      </div>
      {value !== null && <CoverageScale value={value} supporting={effect === "supporting"} />}
      <p className="text-sm leading-relaxed text-text-secondary">{classCopy.interpretation}</p>
      <dl className="mt-auto grid grid-cols-2 gap-px border bg-border">
        {(["supply", "demand"] as const).map((part) => {
          const key = keys[part]
          const label = part === "demand" && flags[keys.manual] ? ui.manual : ui[part]
          return (
            <div key={part} className="flex flex-col gap-1 bg-background px-3 py-2.5">
              <dt className="flex items-center justify-between gap-2 font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">
                {label}
                <CalcInfo source={explainResult(key, flags)} label={`${label} · ${name}`} className="-my-3 -mr-3" />
              </dt>
              <dd className="font-mono text-sm tabular-nums">{formatEnergy(values[key], lang, { perYear: true })}</dd>
            </div>
          )
        })}
      </dl>
    </article>
  )
}
