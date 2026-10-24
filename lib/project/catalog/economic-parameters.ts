import type { EquationId } from "./references"

/** The rows of TBL-6, in table order (keys as in `table-06_economic-parameters.yaml`). */
export const ECONOMIC_PARAMETERS = [
  "heating_base_price",
  "heating_energy_price",
  "cooling_base_price",
  "cooling_energy_price",
  "connection_fee",
  "network_construction_costs",
  "installation_costs_geothermal",
  "installation_costs_waste_heat",
  "installation_costs_ground_water",
  "installation_costs_surface_water",
  "installation_costs_solar_thermal",
  "installation_costs_ambient_air",
  "heat_pump",
  "electricity_cost",
  "pv_cost_reduction",
  "depreciation_period",
  "interest_rate",
] as const

export type EconomicParameter = (typeof ECONOMIC_PARAMETERS)[number]

export interface EconomicParameterInfo {
  /** Unit as printed in TBL-6. `%` values are stored as percent and divided by 100 in the engine (OQ-01). */
  unit: string
  /** The equation symbol the row stands for (TBL-6 `symbol`), when it has one. */
  symbol: string | null
  /** The equations that use this parameter (D-33). */
  feeds: readonly EquationId[]
  /** Open questions flagged on the row (TBL-6 `flags`). */
  flags: readonly string[]
}

/** Unit, symbol, use and flags of each TBL-6 row. A test checks units, symbols and flags against the YAML. */
export const ECONOMIC_PARAMETER_INFO: Record<EconomicParameter, EconomicParameterInfo> = {
  heating_base_price: { unit: "€/m²", symbol: "p_{H,base}", feeds: ["EQ-3.9a"], flags: ["OQ-16"] },
  heating_energy_price: { unit: "€/kWh", symbol: "p_{H,energy}", feeds: ["EQ-3.9a"], flags: [] },
  cooling_base_price: { unit: "€/m²", symbol: "p_{C,base}", feeds: ["EQ-3.9b"], flags: ["OQ-16"] },
  cooling_energy_price: { unit: "€/kWh", symbol: "p_{C,energy}", feeds: ["EQ-3.9b"], flags: [] },
  connection_fee: { unit: "€/building", symbol: "p_{connect}", feeds: ["EQ-3.9c"], flags: [] },
  network_construction_costs: { unit: "€/m", symbol: "c_{net}", feeds: ["EQ-3.10a"], flags: [] },
  installation_costs_geothermal: { unit: "€/(kWh/a)", symbol: "c_{i}", feeds: ["EQ-3.10b"], flags: [] },
  installation_costs_waste_heat: { unit: "€/(kWh/a)", symbol: "c_{i}", feeds: ["EQ-3.10b"], flags: [] },
  installation_costs_ground_water: { unit: "€/(kWh/a)", symbol: "c_{i}", feeds: ["EQ-3.10b"], flags: [] },
  installation_costs_surface_water: { unit: "€/(kWh/a)", symbol: "c_{i}", feeds: ["EQ-3.10b"], flags: [] },
  installation_costs_solar_thermal: { unit: "€/(kWh/a)", symbol: "c_{i}", feeds: ["EQ-3.10b"], flags: [] },
  // TBL-6 prints "-" (no default) and the unit `€/kWh` here; OQ-18 uses 0, flagged in Assumptions.
  installation_costs_ambient_air: { unit: "€/kWh", symbol: "c_{i}", feeds: ["EQ-3.10b"], flags: ["OQ-18"] },
  heat_pump: { unit: "€/building", symbol: "C_{HP}", feeds: ["EQ-3.10d"], flags: [] },
  electricity_cost: { unit: "€/kWh", symbol: "c_{el}", feeds: ["EQ-3.11"], flags: [] },
  pv_cost_reduction: { unit: "%", symbol: null, feeds: ["EQ-3.11"], flags: ["OQ-01", "OQ-06"] },
  depreciation_period: { unit: "a", symbol: "p", feeds: ["EQ-3.10e"], flags: [] },
  interest_rate: { unit: "%", symbol: "i", feeds: ["EQ-3.10e"], flags: ["OQ-01"] },
}
