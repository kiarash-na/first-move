import type { CartesianGridProps, XAxisProps, YAxisProps } from "recharts"

/**
 * Shared look of the Recharts charts (dataviz mark specs): hairline solid grid on the value
 * axis only, no axis lines or ticks, thin bars with a 2px gap in the card colour between
 * touching marks. Radius stays 0 (DESIGN-TOKENS §4).
 */
export const GRID: CartesianGridProps = { horizontal: false, stroke: "var(--border)", strokeDasharray: "0" }

export const VALUE_AXIS: Pick<XAxisProps, "type" | "tickLine" | "axisLine" | "tickMargin" | "tickCount"> = {
  type: "number",
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
  tickCount: 3,
}

export const CATEGORY_AXIS: Pick<YAxisProps, "type" | "tickLine" | "axisLine" | "tickMargin"> = {
  type: "category",
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
}

/** The gap between touching bars and stacked segments: a stroke in the card colour. */
export const BAR_GAP = { stroke: "var(--card)", strokeWidth: 2 } as const

/** Bars are at most 24px thick (never fill the slot). */
export const BAR_SIZE = 22

/** Height of a horizontal bar chart with `rows` category rows and one value axis. */
export function barChartHeight(rows: number, rowHeight = 52): number {
  return rows * rowHeight + 40
}

const NICE_STEPS = [1, 2, 4, 6, 8, 10]

/**
 * The end of a value axis: the next "round" number (1, 2, 4, 6 or 8 times a power of ten) at or
 * above `value`, so three ticks fall on 0, half and the end instead of on odd numbers.
 */
export function niceMax(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = NICE_STEPS.find((candidate) => candidate * magnitude >= value * (1 - 1e-9)) ?? 10
  return step * magnitude
}
