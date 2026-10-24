import { SERIES } from "../../../_components/charts"

/**
 * The six parts of the revenue and cost stacks, in drawing order. Revenues are cyan (money in),
 * costs orange (money out); each stack goes full, tint, hatched grey so neighbours differ in
 * more than colour.
 */
export const ECONOMICS_SERIES = [
  { id: "revenue-base", group: "revenues", part: "base", color: SERIES.cool, hatched: false },
  { id: "revenue-energy", group: "revenues", part: "energy", color: SERIES.coolTint, hatched: false },
  { id: "revenue-connection", group: "revenues", part: "connection", color: SERIES.grey, hatched: true },
  { id: "cost-annualized", group: "costs", part: "annualized", color: SERIES.hot, hatched: false },
  { id: "cost-electricity", group: "costs", part: "electricity", color: SERIES.hotTint, hatched: false },
  { id: "cost-operation", group: "costs", part: "operation", color: SERIES.grey, hatched: true },
] as const

export type EconomicsSeries = (typeof ECONOMICS_SERIES)[number]
