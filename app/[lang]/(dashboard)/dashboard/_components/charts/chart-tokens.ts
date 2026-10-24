/**
 * Chart colours (D-17): the two brand signals, their tints and one Paper grey, all from the
 * `--chart-*` tokens of `app/globals.css`. Cyan = Quick Check / cooling, orange = heating /
 * risk. No other hue. Light and dark come from the tokens, so nothing here depends on the theme.
 */
export const SERIES = {
  cool: "var(--chart-1)",
  hot: "var(--chart-2)",
  coolTint: "var(--chart-3)",
  hotTint: "var(--chart-4)",
  grey: "var(--chart-5)",
} as const

export type SeriesColor = keyof typeof SERIES

/** A swatch can carry the hatch that marks the third series (a second channel besides colour). */
export interface LegendItem {
  id: string
  label: string
  color: string
  hatched?: boolean
  /** A reference line (demand) instead of a filled series. */
  line?: boolean
}

const SURFACE = "var(--card)"

/**
 * An ordered one-hue ramp of `steps` colours, light to dark, for ordinal categories such as the
 * construction periods. Mixes the signal with the card surface, so it stays inside D-17.
 */
export function ramp(tone: "cool" | "hot", steps: number): string[] {
  const hue = tone === "cool" ? "var(--accent-cool)" : "var(--accent-hot)"
  if (steps <= 1) return [hue]
  return Array.from({ length: steps }, (_, index) => {
    const share = Math.round(32 + (index / (steps - 1)) * 68)
    return `color-mix(in oklab, ${hue} ${share}%, ${SURFACE})`
  })
}
