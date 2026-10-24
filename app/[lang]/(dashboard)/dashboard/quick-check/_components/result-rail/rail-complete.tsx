"use client"

import { ArrowRightIcon, LockIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatIndicator } from "@/lib/dashboard/indicator-format"
import { indicatorEffect } from "@/lib/dashboard/indicator-effect"
import { dashboardHref } from "@/lib/dashboard/routes"
import { interpolate } from "@/lib/i18n/interpolate"
import { DEMANDS, explainResult, type QuickCheckComplete } from "@/lib/quick-check"
import { CustomParametersBadge } from "../../../_components/custom-parameters-badge"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { VerdictBadge } from "../../../_components/verdict-badge"
import { RailIndicator } from "./rail-indicator"

/**
 * A complete live result: the verdict and four indicators (coverage per demand, KF-04;
 * building density; heat density; economic ratio), each with its info popover (D-33).
 */
export function RailComplete({ result, headingId }: { result: QuickCheckComplete; headingId?: string }) {
  const lang = useLocale()
  const copy = useDictionary("quick-check")
  const rail = copy.ui.rail
  const classes = copy.results.classes
  const units = copy.ui.results.indicators
  const { assessment, values, flags, drivers } = result

  return (
    <div data-slot="rail-summary" data-status="complete" data-level={assessment.level} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <VerdictBadge level={assessment.level} className="py-1 text-[13px]" />
          <CustomParametersBadge />
        </div>
        <p id={headingId} className="text-sm leading-relaxed text-text-secondary">
          {copy.results.levels[assessment.level].description}
        </p>
        {assessment.forced && (
          <p className="inline-flex items-center gap-1.5 font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">
            <LockIcon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
            {copy.ui.results.forced}
          </p>
        )}
      </div>
      <div className="flex flex-col divide-y border-y">
        {DEMANDS.map((demand) => {
          const key = demand === "heating" ? "heatingCoverage" : "coolingCoverage"
          const value = values[key]
          const coverageClass = result.classes[key]
          return (
            <RailIndicator
              key={demand}
              label={`${rail.indicators.coverage} · ${copy.results.demands[demand].label}`}
              value={value === null ? classes.notRelevant.label : formatIndicator("coverage", value, lang)}
              detail={coverageClass ? classes.coverage[coverageClass].label : undefined}
              effect={indicatorEffect(drivers, demand === "heating" ? "heating_coverage" : "cooling_coverage")}
              explain={explainResult(key, flags)}
            />
          )
        })}
        <RailIndicator
          label={rail.indicators.buildingDensity}
          value={`${formatIndicator("buildingDensity", values.buildingDensity, lang)} ${units.densityUnit}`}
          detail={classes.buildingDensity[result.classes.buildingDensity].label}
          effect={indicatorEffect(drivers, "building_density")}
          explain={explainResult("buildingDensity", flags)}
        />
        <RailIndicator
          label={rail.indicators.heatDensity}
          value={`${formatIndicator("heatDensity", values.heatDensityMwhPerM, lang)} ${units.heatUnit}`}
          detail={classes.heatDensity[result.classes.heatDensity].label}
          effect={indicatorEffect(drivers, "heat_density")}
          explain={explainResult("heatDensityMwhPerM", flags)}
        />
        <RailIndicator
          label={rail.indicators.economic}
          value={
            values.economicRatio === null
              ? classes.notApplicable.label
              : interpolate(units.ratio, { value: formatIndicator("economic", values.economicRatio, lang) })
          }
          detail={result.classes.economic ? classes.economic[result.classes.economic].label : undefined}
          effect={indicatorEffect(drivers, "economics")}
          explain={explainResult("economicRatio", flags)}
        />
      </div>
      <Button asChild variant="secondary" className="justify-between">
        <Link href={dashboardHref(lang, { page: "quick-check", step: "results" })}>
          {rail.open}
          <ArrowRightIcon strokeWidth={1.6} aria-hidden="true" />
        </Link>
      </Button>
      <p className="text-xs leading-normal text-muted-foreground">{rail.screening}</p>
    </div>
  )
}
