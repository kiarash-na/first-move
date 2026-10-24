import type { EconomicParameter } from "@/lib/project/catalog/economic-parameters"

/**
 * Validation limits as data (PLAN-DASH-03 step 2, D-31: the team sets them). The Zod schema
 * and the field registry both read them from here, so they are declared once. They guard
 * against impossible input only; they are not methodology.
 */
export interface NumberLimit {
  /** Inclusive lower bound. */
  min?: number
  /** Exclusive lower bound (`> value`). */
  exclusiveMin?: number
  /** Inclusive upper bound. */
  max: number
  integer?: boolean
}

export const LIMITS = {
  /** QCT-IN-01: 1–100 000 buildings, whole numbers. */
  buildingsTotal: { min: 1, max: 100_000, integer: true },
  /** QCT-IN-02: entered in m² (D-31), > 0; at most 1 000 km². */
  areaM2: { exclusiveMin: 0, max: 1_000_000_000 },
  /** QCT-IN-04: one cell of the share grid, in % as typed (the engine divides by 100, OQ-01). */
  share: { min: 0, max: 100 },
  /** QCT-IN-05: an optional manual total in kWh/a (OQ-05); 0 is allowed (e.g. no cooling). */
  manualDemandKwhPerYear: { min: 0, max: 10_000_000_000 },
  /** QCT-IN-08: optional manual network length in m, > 0; at most 1 000 km. */
  networkLengthM: { exclusiveMin: 0, max: 1_000_000 },
  /** D-10 override of a TBL-4/5 capacity in kWh/a. */
  capacityKwhPerYear: { min: 0, max: 1_000_000_000 },
  /** D-10 override of a heating COP: EQ-3.8a divides by COP − 1, so COP must exceed 1. */
  heatingCop: { exclusiveMin: 1, max: 20 },
  /** D-10 override of a cooling COP: EQ-3.11 divides by COP, so COP must exceed 0. */
  coolingCop: { exclusiveMin: 0, max: 20 },
} as const satisfies Record<string, NumberLimit>

/** D-10 overrides of TBL-6, per row. `%` rows are stored as percent (OQ-01). */
export const ECONOMIC_LIMITS: Record<EconomicParameter, NumberLimit> = {
  heating_base_price: { min: 0, max: 1_000 },
  heating_energy_price: { min: 0, max: 10 },
  cooling_base_price: { min: 0, max: 1_000 },
  cooling_energy_price: { min: 0, max: 10 },
  connection_fee: { min: 0, max: 1_000_000 },
  network_construction_costs: { min: 0, max: 100_000 },
  installation_costs_geothermal: { min: 0, max: 1_000 },
  installation_costs_waste_heat: { min: 0, max: 1_000 },
  installation_costs_ground_water: { min: 0, max: 1_000 },
  installation_costs_surface_water: { min: 0, max: 1_000 },
  installation_costs_solar_thermal: { min: 0, max: 1_000 },
  installation_costs_ambient_air: { min: 0, max: 1_000 },
  heat_pump: { min: 0, max: 10_000_000 },
  electricity_cost: { min: 0, max: 10 },
  pv_cost_reduction: { min: 0, max: 100 },
  depreciation_period: { min: 1, max: 100, integer: true },
  interest_rate: { min: 0, max: 100 },
}

/**
 * QCT-IN-04 / R-03: the shares must add up to 100 %. Only float tolerance is allowed;
 * any other sum leaves the Quick Check incomplete (no result), it is not a patch error.
 */
export const SHARE_SUM = { target: 100, tolerance: 1e-6 } as const

/**
 * QCT-IN-06: a Quick Check result needs at least one selected source. Documented default of
 * this phase (no source = not filled in yet), so an empty list shows no result.
 */
export const MIN_SELECTED_SOURCES = 1

/** Free text (stored as typed, D-21): maximum lengths and list sizes. */
export const TEXT_LIMITS = {
  /** Project name. */
  name: 120,
  /** One-line text and each entry of a text list. */
  short: 200,
  /** Multi-line text (canvas blocks, descriptions). */
  long: 5_000,
  /** Entries of a text list (stakeholders, current supply, partners). */
  listEntries: 30,
  /** Rows of an item list (allocation, risks, critical assumptions). */
  listItems: 30,
} as const
