type Dimension = "area" | "energy" | "length" | "price" | "percent" | "time"

/** Units a document may state, with the factor to their dimension's base unit. */
const UNITS: Record<string, { dimension: Dimension; factor: number }> = {
  "m²": { dimension: "area", factor: 1 },
  ha: { dimension: "area", factor: 10_000 },
  "km²": { dimension: "area", factor: 1_000_000 },
  "kWh/a": { dimension: "energy", factor: 1 },
  "MWh/a": { dimension: "energy", factor: 1_000 },
  "GWh/a": { dimension: "energy", factor: 1_000_000 },
  m: { dimension: "length", factor: 1 },
  km: { dimension: "length", factor: 1_000 },
  "€/kWh": { dimension: "price", factor: 1 },
  "ct/kWh": { dimension: "price", factor: 0.01 },
  "€/MWh": { dimension: "price", factor: 0.001 },
  "%": { dimension: "percent", factor: 1 },
  a: { dimension: "time", factor: 1 },
}

const ENERGY_SUFFIXES = ["", "/a", "/yr", "/y", "/year", "/jahr", "pa", "p.a.", "/annum", "peryear", "projahr"]

/** Spellings found in documents (as `squash` leaves them) → unit. Annual energy may omit "/a". */
const ALIASES: Record<string, string> = {
  m2: "m²", "m^2": "m²", qm: "m²", sqm: "m²", quadratmeter: "m²", squaremetres: "m²", squaremeters: "m²",
  ha: "ha", hektar: "ha", hectare: "ha", hectares: "ha",
  km2: "km²", "km^2": "km²",
  ...Object.fromEntries(
    Object.entries({ k: "kWh/a", m: "MWh/a", g: "GWh/a" }).flatMap(([prefix, unit]) => ENERGY_SUFFIXES.map((suffix) => [`${prefix}wh${suffix}`, unit])),
  ),
  m: "m", meter: "m", meters: "m", metre: "m", metres: "m",
  km: "km", kilometer: "km", kilometers: "km", kilometre: "km", kilometres: "km",
  "€/kwh": "€/kWh", "ct/kwh": "ct/kWh", "cent/kwh": "ct/kWh", "cents/kwh": "ct/kWh", "€/mwh": "€/MWh",
  "%": "%", percent: "%", prozent: "%",
  a: "a", year: "a", years: "a", yr: "a", yrs: "a", jahr: "a", jahre: "a",
}

/** Lower case, no spaces, NFKC (m² → m2), EUR and Euro written as €. */
const squash = (unit: string) =>
  unit
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/euros?|eur/g, "€")

/** The unit a spelling stands for (`MWh`, `mwh/a` → `MWh/a`), or null when it is not one we convert. */
export function normalizeUnit(unit: string): string | null {
  return ALIASES[squash(unit)] ?? null
}

export type UnitConversion = { ok: true; value: number } | { ok: false; reason: "unknown-unit" | "unit-mismatch" }

/**
 * Converts a value from the unit a model stated to the field's unit (PLAN-AGENT-03 step 4): only
 * when a unit was stated and differs, within one dimension (m² ↔ ha ↔ km², kWh ↔ MWh ↔ GWh per
 * year, m ↔ km, €/kWh ↔ ct/kWh ↔ €/MWh, years). A field without a unit (counts, COPs) ignores the
 * stated unit; a unit of another dimension or an unknown one is never guessed.
 */
export function convertUnit(value: number, stated: string | undefined, fieldUnit: string | undefined): UnitConversion {
  if (!stated?.trim() || !fieldUnit || squash(stated) === squash(fieldUnit)) return { ok: true, value }
  const from = normalizeUnit(stated)
  if (!from) return { ok: false, reason: "unknown-unit" }
  const to = normalizeUnit(fieldUnit)
  if (!to || UNITS[from].dimension !== UNITS[to].dimension) return { ok: false, reason: "unit-mismatch" }
  if (from === to) return { ok: true, value }
  return { ok: true, value: Number(((value * UNITS[from].factor) / UNITS[to].factor).toPrecision(12)) }
}
