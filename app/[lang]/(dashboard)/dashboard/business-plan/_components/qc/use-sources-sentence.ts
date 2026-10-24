"use client"

import type { SharedSiteData } from "@/lib/business-plan"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary } from "../../../_components/i18n-provider"

/** "Sources screened in the Quick Check: Waste heat (High), Ground water (Medium)." or null when none. */
export function useSourcesSentence(shared: SharedSiteData): string | null {
  const bp = useDictionary("business-plan")
  const qc = useDictionary("quick-check")
  if (shared.sources.length === 0) return null
  const sources = shared.sources
    .map(({ source, potential }) => `${qc.sources[source].label} (${qc.potentials[potential].label})`)
    .join(", ")
  return interpolate(bp.qc.sourcesSentence, { sources })
}
