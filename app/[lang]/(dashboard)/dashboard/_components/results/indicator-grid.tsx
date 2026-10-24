"use client"

import { Building2Icon, CoinsIcon, ScaleIcon, ThermometerIcon } from "lucide-react"
import { formatIndicator } from "@/lib/dashboard/indicator-format"
import { indicatorEffect } from "@/lib/dashboard/indicator-effect"
import { formatQuantity } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { explainResult, type QuickCheckComplete } from "@/lib/quick-check"
import { useDictionary, useLocale } from "../i18n-provider"
import { IndicatorCard } from "./indicator-card"
import { NetworkLengthTag } from "./network-length-tag"

/**
 * One card per indicator class (QCT-KF-02): building density (TBL-8, with the OQ-04 category),
 * heat density (TBL-9, with the network-length tag), CH ratio (TBL-10, with the dominant
 * demand, OQ-12) and the economic assessment (OQ-21).
 */
export function IndicatorGrid({ result }: { result: QuickCheckComplete }) {
  const lang = useLocale()
  const copy = useDictionary("quick-check")
  const ui = copy.ui.results.indicators
  const classes = copy.results.classes
  const { values, flags, drivers } = result
  const chClass = result.classes.chRatio
  const economic = result.classes.economic
  const notApplicable = classes.notApplicable

  return (
    <section aria-labelledby="indicators-title" data-slot="indicators" className="flex flex-col gap-4">
      <h2 id="indicators-title" className="text-xl leading-tight font-[560] tracking-[-0.035em] [font-stretch:86%]">
        {ui.title}
      </h2>
      <div className="grid gap-px border bg-border sm:grid-cols-2 xl:grid-cols-4">
        <IndicatorCard
          id="buildingDensity"
          icon={Building2Icon}
          title={ui.buildingDensity}
          value={formatIndicator("buildingDensity", values.buildingDensity, lang)}
          unit={ui.densityUnit}
          classLabel={classes.buildingDensity[result.classes.buildingDensity].label}
          interpretation={classes.buildingDensity[result.classes.buildingDensity].interpretation}
          effect={indicatorEffect(drivers, "building_density")}
          explain={explainResult("buildingDensity", flags)}
        >
          {interpolate(ui.category, { category: copy.derived.densityCategory.options[result.classes.densityCategory].label })}
        </IndicatorCard>
        <IndicatorCard
          id="heatDensity"
          icon={ThermometerIcon}
          title={ui.heatDensity}
          value={formatIndicator("heatDensity", values.heatDensityMwhPerM, lang)}
          unit={ui.heatUnit}
          classLabel={classes.heatDensity[result.classes.heatDensity].label}
          interpretation={classes.heatDensity[result.classes.heatDensity].interpretation}
          effect={indicatorEffect(drivers, "heat_density")}
          explain={explainResult("heatDensityMwhPerM", flags)}
        >
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {copy.ui.results.network.title}: {formatQuantity(values.networkLengthM, "m", lang, { maximumFractionDigits: 0 })}
            <NetworkLengthTag flags={flags} />
          </span>
        </IndicatorCard>
        <IndicatorCard
          id="chRatio"
          icon={ScaleIcon}
          title={ui.chRatio}
          value={formatIndicator("chRatio", values.chRatio, lang)}
          classLabel={chClass ? classes.chRatio[chClass].label : notApplicable.label}
          interpretation={chClass ? classes.chRatio[chClass].interpretation : notApplicable.interpretation}
          effect={null}
          explain={explainResult("chRatio", flags)}
        >
          {values.dominantDemand && copy.results.dominantDemand[values.dominantDemand].label}
        </IndicatorCard>
        <IndicatorCard
          id="economic"
          icon={CoinsIcon}
          title={ui.economic}
          value={values.economicRatio === null ? notApplicable.label : interpolate(ui.ratio, { value: formatIndicator("economic", values.economicRatio, lang) })}
          classLabel={economic ? classes.economic[economic].label : notApplicable.label}
          interpretation={economic ? classes.economic[economic].interpretation : notApplicable.interpretation}
          effect={indicatorEffect(drivers, "economics")}
          explain={explainResult("economicRatio", flags)}
        />
      </div>
    </section>
  )
}
