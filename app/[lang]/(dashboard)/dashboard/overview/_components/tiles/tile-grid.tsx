"use client"

import { Building2Icon, CoinsIcon, PercentIcon, RulerIcon, ScaleIcon, ThermometerIcon, WrenchIcon, ZapIcon } from "lucide-react"

import { indicatorEffect } from "@/lib/dashboard/indicator-effect"
import { formatEur, formatNumber, formatQuantity } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { explainResult, type QuickCheckComplete } from "@/lib/quick-check"
import { CalcInfo } from "../../../_components/how-we-calculate"
import { EffectMark } from "../../../_components/effect-mark"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { MetricTile } from "./metric-tile"

/**
 * The secondary tiles (PLAN-DASH-09 step 4): building density, heat density, CH ratio, network
 * length (entered or estimated), electricity, O&M, annuity, and the revenue-to-cost ratio.
 */
export function TileGrid({ result }: { result: QuickCheckComplete }) {
  const lang = useLocale()
  const overview = useDictionary("overview")
  const qc = useDictionary("quick-check")
  const copy = overview.tiles
  const ui = qc.ui.results
  const classes = qc.results.classes
  const { values, flags, drivers } = result
  const info = (key: Parameters<typeof explainResult>[0], label: string) => <CalcInfo source={explainResult(key, flags)} label={label} />
  const perYear = overview.kpi.perYear
  const chClass = result.classes.chRatio
  const economic = result.classes.economic

  return (
    <section aria-labelledby="overview-tiles" data-slot="tile-grid" className="flex flex-col gap-4">
      <h2 id="overview-tiles" className="text-xl leading-tight font-[560] tracking-[-0.035em] [font-stretch:86%]">
        {overview.sections.indicators}
      </h2>
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        <MetricTile
          id="buildingDensity"
          icon={Building2Icon}
          label={copy.buildingDensity}
          value={formatNumber(values.buildingDensity, lang, { maximumFractionDigits: 1 })}
          unit={ui.indicators.densityUnit}
          detail={
            <>
              <EffectMark effect={indicatorEffect(drivers, "building_density")} />
              {classes.buildingDensity[result.classes.buildingDensity].label}
            </>
          }
          info={info("buildingDensity", copy.buildingDensity)}
        />
        <MetricTile
          id="heatDensity"
          icon={ThermometerIcon}
          label={copy.heatDensity}
          value={formatNumber(values.heatDensityMwhPerM, lang, { maximumFractionDigits: 2 })}
          unit={ui.indicators.heatUnit}
          detail={
            <>
              <EffectMark effect={indicatorEffect(drivers, "heat_density")} />
              {classes.heatDensity[result.classes.heatDensity].label}
            </>
          }
          info={info("heatDensityMwhPerM", copy.heatDensity)}
        />
        <MetricTile
          id="chRatio"
          icon={ScaleIcon}
          label={copy.chRatio}
          value={formatNumber(values.chRatio, lang, { maximumFractionDigits: 2 })}
          detail={
            <>
              {chClass ? classes.chRatio[chClass].label : classes.notApplicable.label}
              {values.dominantDemand && <span className="text-muted-foreground">· {qc.results.dominantDemand[values.dominantDemand].label}</span>}
            </>
          }
          info={info("chRatio", copy.chRatio)}
        />
        <MetricTile
          id="networkLength"
          icon={RulerIcon}
          label={copy.networkLength}
          value={formatQuantity(values.networkLengthM, "m", lang, { maximumFractionDigits: 0 })}
          detail={flags.manualNetworkLength ? ui.network.manual : ui.network.estimated}
          info={info("networkLengthM", copy.networkLength)}
        />
        <MetricTile
          id="electricity"
          icon={ZapIcon}
          label={copy.electricity}
          value={formatEur(values.electricityCosts, lang, { compact: true })}
          unit={perYear}
          info={info("electricityCosts", copy.electricity)}
        />
        <MetricTile
          id="operation"
          icon={WrenchIcon}
          label={copy.operation}
          value={formatEur(values.operationAndMaintenance, lang, { compact: true })}
          unit={perYear}
          info={info("operationAndMaintenance", copy.operation)}
        />
        <MetricTile
          id="annuity"
          icon={CoinsIcon}
          label={copy.annuity}
          value={formatEur(values.annualizedCosts, lang, { compact: true })}
          unit={perYear}
          detail={copy.annuityHint}
          info={info("annualizedCosts", copy.annuity)}
        />
        <MetricTile
          id="economicRatio"
          icon={PercentIcon}
          label={copy.economicRatio}
          value={values.economicRatio === null ? classes.notApplicable.label : interpolate(ui.indicators.ratio, { value: formatNumber(values.economicRatio, lang, { maximumFractionDigits: 2 }) })}
          detail={
            <>
              <EffectMark effect={indicatorEffect(drivers, "economics")} />
              {economic ? classes.economic[economic].label : classes.notApplicable.label}
            </>
          }
          info={info("economicRatio", copy.economicRatio)}
        />
      </div>
    </section>
  )
}
