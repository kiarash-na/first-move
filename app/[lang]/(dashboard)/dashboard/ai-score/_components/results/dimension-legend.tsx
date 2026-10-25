"use client"

import { useDictionary } from "../../../_components/i18n-provider"

/**
 * The legend of the dimension bars: each key mirrors its mark (dataviz), so identity never rests
 * on colour alone: the score bar, the paler bar before a cap, the cap line and the whisker.
 */
export function DimensionLegend() {
  const copy = useDictionary("ai-score").results.dimensions.legend
  return (
    <ul data-slot="dimension-legend" className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-text-secondary">
      <li className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="h-2.5 w-4 bg-hot" />
        {copy.score}
      </li>
      <li className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="h-2.5 w-4 bg-chart-4" />
        {copy.raw}
      </li>
      <li className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="h-3.5 w-0.5 bg-foreground" />
        {copy.cap}
      </li>
      <li className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="relative h-2.5 w-4 border-x border-foreground/70 before:absolute before:inset-x-0 before:top-1/2 before:h-px before:bg-foreground/70" />
        {copy.band}
      </li>
    </ul>
  )
}
