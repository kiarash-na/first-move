import type { Locale } from "../locales"
import { EMPTY_VALUE, isFiniteNumber } from "./intl-locale"
import { formatNumber } from "./number"

export type EnergyUnit = "kWh" | "MWh" | "GWh"

const STEPS: { unit: EnergyUnit; factor: number }[] = [
  { unit: "GWh", factor: 1_000_000 },
  { unit: "MWh", factor: 1_000 },
  { unit: "kWh", factor: 1 },
]

/** Picks the largest unit that keeps the value ≥ 1 (by magnitude): `12 500 kWh` → `12.5 MWh`. */
export function scaleEnergy(kWh: number): { value: number; unit: EnergyUnit } {
  const step = STEPS.find((s) => Math.abs(kWh) >= s.factor) ?? STEPS[STEPS.length - 1]
  return { value: kWh / step.factor, unit: step.unit }
}

/** Default precision: 2 digits below 10, 1 below 100, none above. */
function defaultDigits(value: number): number {
  const magnitude = Math.abs(value)
  if (magnitude < 10) return 2
  if (magnitude < 100) return 1
  return 0
}

export interface EnergyOptions {
  /** Append `/a` (per year), as in the methodology. */
  perYear?: boolean
  fractionDigits?: number
}

/** Energy in kWh, auto-scaled to kWh/MWh/GWh (D-21): `1.23 GWh/a` / `1,23 GWh/a`. */
export function formatEnergy(
  kWh: number | null | undefined,
  lang: Locale,
  { perYear = false, fractionDigits }: EnergyOptions = {},
): string {
  if (!isFiniteNumber(kWh)) return EMPTY_VALUE
  const { value, unit } = scaleEnergy(kWh)
  const number = formatNumber(value, lang, {
    maximumFractionDigits: fractionDigits ?? defaultDigits(value),
  })
  return `${number} ${unit}${perYear ? "/a" : ""}`
}
