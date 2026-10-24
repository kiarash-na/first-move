"use client"

import { Building2Icon, MapIcon } from "lucide-react"
import { formatNumber } from "@/lib/i18n/format"
import { areaPreview, DENSITY_CLASSES, RESULT_EXPLAIN } from "@/lib/quick-check"
import { cn } from "@/lib/utils"
import { CalcInfo } from "../../../../_components/how-we-calculate"
import { useDictionary, useLocale } from "../../../../_components/i18n-provider"
import { useStoreState } from "../../../../_components/store-provider"

/**
 * The read-only values of the area step: building density (EQ-3.3) with its TBL-8 class, and
 * the rural / sub-urban / urban category derived from it (QCT-IN-03, OQ-04). Not inputs.
 */
export function DensityPreview() {
  const lang = useLocale()
  const copy = useDictionary("quick-check")
  const total = useStoreState((state) => state.active?.buildings.total ?? null)
  const area = useStoreState((state) => state.active?.buildings.areaM2 ?? null)
  const preview = areaPreview(total, area)
  const derived = copy.derived.densityCategory

  return (
    <section aria-labelledby="density-preview" data-slot="density-preview" className="flex flex-col gap-4">
      <h2 id="density-preview" className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">
        {copy.ui.area.derived}
      </h2>
      {preview ? (
        <div className="grid gap-px border bg-border @xl:grid-cols-2">
          <div className="flex flex-col gap-3 bg-background p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-[15px] font-[480]">
                <Building2Icon className="size-4 text-primary" strokeWidth={1.6} aria-hidden="true" />
                {copy.ui.area.density}
              </span>
              <CalcInfo source={RESULT_EXPLAIN.buildingDensity} label={copy.ui.area.density} className="-m-2.5" />
            </div>
            <p className="font-mono text-2xl tracking-[-0.02em] tabular-nums">
              {formatNumber(preview.buildingDensity, lang, { maximumFractionDigits: 1 })}
              <span className="ml-2 text-xs tracking-[0.04em] text-muted-foreground uppercase">{copy.ui.area.densityUnit}</span>
            </p>
            <ol className="grid grid-cols-3 gap-1" aria-label={copy.results.classes.buildingDensity[preview.densityClass].label}>
              {[...DENSITY_CLASSES].reverse().map((densityClass) => (
                <li
                  key={densityClass}
                  aria-current={densityClass === preview.densityClass ? "true" : undefined}
                  className={cn(
                    "border-t-2 pt-1.5 font-mono text-xs tracking-[0.04em] uppercase",
                    densityClass === preview.densityClass ? "border-primary text-primary" : "border-border text-muted-foreground",
                  )}
                >
                  {copy.results.classes.buildingDensity[densityClass].label}
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col gap-3 bg-background p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-[15px] font-[480]">
                <MapIcon className="size-4 text-primary" strokeWidth={1.6} aria-hidden="true" />
                {derived.label}
              </span>
              <CalcInfo source={RESULT_EXPLAIN.densityCategory} label={derived.label} className="-m-2.5" />
            </div>
            <p className="text-2xl leading-tight font-[560] tracking-[-0.035em] [font-stretch:86%]" data-category={preview.densityCategory}>
              {derived.options[preview.densityCategory].label}
            </p>
            <p className="text-sm leading-normal text-muted-foreground">{derived.help}</p>
          </div>
        </div>
      ) : (
        <p className="border border-dashed p-5 text-sm leading-relaxed text-muted-foreground">{copy.ui.area.pending}</p>
      )}
    </section>
  )
}
