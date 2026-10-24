"use client"

import { CoinsIcon, FlameIcon, LandmarkIcon, ReceiptTextIcon, SnowflakeIcon, type LucideIcon } from "lucide-react"

import { formatIndicator } from "@/lib/dashboard/indicator-format"
import { splitUnit } from "@/lib/dashboard/overview"
import { indicatorEffect } from "@/lib/dashboard/indicator-effect"
import { formatEnergy, formatEur } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { explainResult, type QuickCheckComplete } from "@/lib/quick-check"
import { CalcInfo } from "../../../_components/how-we-calculate"
import { EffectMark } from "../../../_components/effect-mark"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { KpiCard } from "./kpi-card"
import { KpiGroup } from "./kpi-group"

/**
 * The seven primary numbers (PLAN-DASH-09 step 3): coverage and demand for heating and cooling,
 * then revenue, investment and annual cost. Each has its "How we calculate" popover (D-33).
 */
export function KpiGrid({ result }: { result: QuickCheckComplete }) {
  const lang = useLocale()
  const overview = useDictionary("overview")
  const qc = useDictionary("quick-check")
  const copy = overview.kpi
  const { values, flags, classes, drivers } = result

  const info = (key: Parameters<typeof explainResult>[0], label: string) => <CalcInfo source={explainResult(key, flags)} label={label} />
  const energy = (kwh: number) => formatEnergy(kwh, lang, { perYear: true })
  const energyParts = (kwh: number) => splitUnit(energy(kwh))

  const coverage = (demand: "heating" | "cooling", icon: LucideIcon) => {
    const key = demand === "heating" ? "heatingCoverage" : "coolingCoverage"
    const value = values[key]
    const label = copy[key]
    const classKey = classes[key]
    const effect = indicatorEffect(drivers, demand === "heating" ? "heating_coverage" : "cooling_coverage")
    return (
      <KpiCard
        id={key}
        icon={icon}
        tone={demand === "heating" ? "hot" : "cool"}
        label={label}
        value={value === null ? qc.results.classes.notRelevant.label : formatIndicator("coverage", value, lang)}
        status={
          <>
            <EffectMark effect={effect} />
            {classKey ? qc.results.classes.coverage[classKey].label : copy.notRelevant}
          </>
        }
        note={
          value === null
            ? undefined
            : interpolate(copy.supplyOfDemand, {
                supply: energy(demand === "heating" ? values.heatingSupplyKwh : values.coolingSupplyKwh),
                demand: energy(demand === "heating" ? values.heatingDemandKwh : values.coolingDemandKwh),
              })
        }
        info={info(key, label)}
      />
    )
  }

  const money = (id: string, icon: LucideIcon, label: string, value: number, key: Parameters<typeof explainResult>[0], perYear: boolean) => (
    <KpiCard id={id} icon={icon} tone="cool" label={label} value={formatEur(value, lang, { compact: true })} unit={perYear ? copy.perYear : undefined} info={info(key, label)} />
  )

  return (
    <section aria-labelledby="overview-kpis" data-slot="kpi-grid" className="flex flex-col gap-6">
      <h2 id="overview-kpis" className="text-xl leading-tight font-[560] tracking-[-0.035em] [font-stretch:86%]">
        {overview.sections.kpis}
      </h2>
      <KpiGroup id="kpis-energy" title={overview.sections.energy}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {coverage("heating", FlameIcon)}
          {coverage("cooling", SnowflakeIcon)}
          <KpiCard id="heatingDemand" icon={FlameIcon} tone="hot" label={copy.heatingDemand} value={energyParts(values.heatingDemandKwh).number} unit={energyParts(values.heatingDemandKwh).unit} info={info("heatingDemandKwh", copy.heatingDemand)} note={flags.manualHeatingDemand ? qc.ui.results.coverage.manual : undefined} />
          <KpiCard id="coolingDemand" icon={SnowflakeIcon} tone="cool" label={copy.coolingDemand} value={energyParts(values.coolingDemandKwh).number} unit={energyParts(values.coolingDemandKwh).unit} info={info("coolingDemandKwh", copy.coolingDemand)} note={flags.manualCoolingDemand ? qc.ui.results.coverage.manual : undefined} />
        </div>
      </KpiGroup>
      <KpiGroup id="kpis-economics" title={overview.sections.economics}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {money("revenue", CoinsIcon, copy.revenue, values.overallRevenue, "overallRevenue", true)}
          {money("investment", LandmarkIcon, copy.investment, values.overallInvestment, "overallInvestment", false)}
          {money("annualCosts", ReceiptTextIcon, copy.annualCosts, values.annualCosts, "annualCosts", true)}
        </div>
      </KpiGroup>
    </section>
  )
}

