/**
 * Construction periods: the columns of TBL-1..3, in table order. Keys are code identifiers;
 * the UI shows the printed labels verbatim (OQ-03) from the `quick-check` dictionary
 * (`periods.<key>.label`). No logic depends on the boundary year.
 */
export const CONSTRUCTION_PERIODS = ["until_1919", "1919_1960", "1961_1990", "1991_2010", "2011_today"] as const

export type ConstructionPeriod = (typeof CONSTRUCTION_PERIODS)[number]

/** The column header exactly as printed in TBL-1..3, for each period key. */
export const PERIOD_COLUMNS: Record<ConstructionPeriod, string> = {
  until_1919: "-1919",
  "1919_1960": "1919-1960",
  "1961_1990": "1961-1990",
  "1991_2010": "1991-2010",
  "2011_today": "2011-today",
}
