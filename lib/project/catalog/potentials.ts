/** Potential of a selected source (QCT-IN-07): Low, Medium, High or Unknown. */
export const POTENTIALS = ["low", "medium", "high", "unknown"] as const

export type Potential = (typeof POTENTIALS)[number]

/**
 * The levels that have a TBL-4/TBL-5 column. `unknown` has none: it adds no supply, cost or
 * electricity (R-01) and forces "Further analysis required" (QCT-RULE-UNKNOWN).
 */
export const CAPACITY_LEVELS = ["low", "medium", "high"] as const satisfies readonly Potential[]

export type CapacityLevel = (typeof CAPACITY_LEVELS)[number]

/** The columns of TBL-4 and TBL-5: one capacity per level, then the COP. */
export const CAPACITY_CELLS = [...CAPACITY_LEVELS, "cop"] as const

export type CapacityCell = (typeof CAPACITY_CELLS)[number]
