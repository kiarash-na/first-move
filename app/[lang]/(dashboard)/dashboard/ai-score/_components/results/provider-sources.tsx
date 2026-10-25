"use client"

import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary } from "../../../_components/i18n-provider"
import { citedDimensions, PROVIDER_IDS } from "./citations"

const GROUPS = [
  { id: "brief", prefix: "BM-" },
  { id: "talk", prefix: "ALG-" },
] as const

/**
 * The provider sources the scoring was built on: the challenge brief (`BM-…`) and the talk of the
 * research project Anergie Leicht Gemacht (`ALG-…`). Cited by id and title, without a link.
 */
export function ProviderSources() {
  const copy = useDictionary("ai-score")
  const text = copy.results.sources
  const titles = text.items as Record<string, string | undefined>

  return (
    <div data-slot="provider-sources" className="grid gap-x-8 gap-y-4 md:grid-cols-2">
      {GROUPS.map((group) => {
        const ids = PROVIDER_IDS.filter((id) => id.startsWith(group.prefix) && titles[id])
        if (ids.length === 0) return null
        return (
          <section key={group.id} aria-label={text[group.id]} data-group={group.id} className="flex flex-col gap-1.5">
            <p className="text-sm font-[520]">{text[group.id]}</p>
            <ul className="flex flex-col divide-y divide-border border-y">
              {ids.map((id) => {
                const dimensions = citedDimensions(id).map((dimension) => copy.labels.dimensions[dimension].name)
                return (
                  <li key={id} data-source={id} className="grid gap-x-3 gap-y-0.5 py-2 text-sm sm:grid-cols-[6.5rem_minmax(0,1fr)]">
                    <span className="font-mono text-xs text-muted-foreground">{id}</span>
                    <span className="flex flex-col gap-0.5">
                      <span>{titles[id]}</span>
                      {dimensions.length > 0 && (
                        <span className="text-xs text-muted-foreground">{interpolate(text.citedBy, { dimensions: dimensions.join(" · ") })}</span>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
