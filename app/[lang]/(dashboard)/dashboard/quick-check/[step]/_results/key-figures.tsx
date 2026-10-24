"use client"

import { formatEnergy, formatEur, formatNumber, formatQuantity } from "@/lib/i18n/format"
import type { Locale } from "@/lib/i18n/locales"
import { explainResult, type ExplainedResult, type QuickCheckComplete, type QuickCheckValues } from "@/lib/quick-check"
import { CalcInfo } from "../../../_components/how-we-calculate"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { NetworkLengthTag } from "./network-length-tag"

type FigureKey = Extract<
  ExplainedResult & keyof QuickCheckValues,
  | "heatingDemandKwh"
  | "coolingDemandKwh"
  | "heatingSupplyKwh"
  | "coolingSupplyKwh"
  | "networkLengthM"
  | "specificNetworkLength"
  | "overallRevenue"
  | "overallInvestment"
  | "annualizedCosts"
  | "electricityCosts"
  | "operationAndMaintenance"
  | "annualCosts"
>
type Unit = "energy" | "eur" | "eurPerYear" | "metres" | "metresPerHectare"

const GROUPS: { id: "demand" | "network" | "economics"; figures: [FigureKey, Unit][] }[] = [
  {
    id: "demand",
    figures: [
      ["heatingDemandKwh", "energy"],
      ["coolingDemandKwh", "energy"],
      ["heatingSupplyKwh", "energy"],
      ["coolingSupplyKwh", "energy"],
    ],
  },
  {
    id: "network",
    figures: [
      ["networkLengthM", "metres"],
      ["specificNetworkLength", "metresPerHectare"],
    ],
  },
  {
    id: "economics",
    figures: [
      ["overallRevenue", "eurPerYear"],
      ["overallInvestment", "eur"],
      ["annualizedCosts", "eurPerYear"],
      ["electricityCosts", "eurPerYear"],
      ["operationAndMaintenance", "eurPerYear"],
      ["annualCosts", "eurPerYear"],
    ],
  },
]

function formatFigure(value: number | null, unit: Unit, lang: Locale, perYear: string, perHectare: string): string {
  switch (unit) {
    case "energy":
      return formatEnergy(value, lang, { perYear: true })
    case "eur":
      return formatEur(value, lang)
    case "eurPerYear":
      return value === null ? formatEur(value, lang) : `${formatEur(value, lang)}${perYear}`
    case "metres":
      return formatQuantity(value, "m", lang, { maximumFractionDigits: 0 })
    case "metresPerHectare":
      return `${formatNumber(value, lang, { maximumFractionDigits: 1 })} ${perHectare}`
  }
}

/** The main numbers behind the indicators, each with how it is calculated (D-33). */
export function KeyFigures({ result }: { result: QuickCheckComplete }) {
  const lang = useLocale()
  const ui = useDictionary("quick-check").ui.results.figures
  const { values, flags } = result
  return (
    <section aria-labelledby="figures-title" data-slot="key-figures" className="flex flex-col gap-4">
      <h2 id="figures-title" className="text-xl leading-tight font-[560] tracking-[-0.035em] [font-stretch:86%]">
        {ui.title}
      </h2>
      <div className="grid gap-px border bg-border lg:grid-cols-3">
        {GROUPS.map((group) => (
          <div key={group.id} className="flex flex-col bg-background">
            <h3 className="border-b px-5 py-3 font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">{ui[group.id]}</h3>
            <dl className="flex flex-col divide-y">
              {group.figures.map(([key, unit]) => (
                <div key={key} data-figure={key} className="flex min-h-14 items-center gap-3 py-1.5 pr-2 pl-5">
                  <dt className="flex min-w-0 flex-1 flex-col gap-1 text-sm leading-snug text-text-secondary">
                    {ui[key]}
                    {key === "networkLengthM" && <NetworkLengthTag flags={flags} />}
                  </dt>
                  <dd className="text-right font-mono text-sm text-foreground tabular-nums">
                    {formatFigure(values[key], unit, lang, ui.perYear, ui.metresPerHectare)}
                  </dd>
                  <CalcInfo source={explainResult(key, flags)} label={ui[key]} />
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  )
}
