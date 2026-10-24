"use client"

import { TriangleAlertIcon } from "lucide-react"
import { INDUSTRY } from "@/lib/project"
import { useDictionary } from "../../../../_components/i18n-provider"

/**
 * What each building type covers (QCT-REF-TYPES), under the wide share grid so its rows stay
 * compact. Narrow layouts show the same text in each row instead.
 */
export function ShareLegend({ types }: { types: readonly string[] }) {
  const copy = useDictionary("quick-check")
  return (
    <dl data-slot="share-legend" className="hidden gap-x-8 gap-y-3 @xl:grid @xl:grid-cols-2">
      {types.map((type) => {
        const typeCopy = copy.buildingTypes[type as keyof typeof copy.buildingTypes]
        const industry = type === INDUSTRY
        return (
          <div key={type} className={industry ? "@xl:col-span-2" : undefined}>
            <dt className="inline-flex items-center gap-1.5 font-mono text-xs tracking-[0.04em] text-foreground uppercase">
              {industry && <TriangleAlertIcon className="size-3.5 text-hot" strokeWidth={1.8} aria-hidden="true" />}
              {typeCopy.label}
            </dt>
            <dd className="text-sm leading-snug text-muted-foreground">{typeCopy.description}</dd>
          </div>
        )
      })}
    </dl>
  )
}
