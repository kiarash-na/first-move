import type { Locale } from "../locales"
import { formatQuantity } from "./number"

const M2_PER_HA = 10_000

/** Area entered in m² (D-31): `12,500 m²`. */
export function formatSquareMeters(m2: number | null | undefined, lang: Locale): string {
  return formatQuantity(m2, "m²", lang, { maximumFractionDigits: 0 })
}

/** The same area in hectares, shown next to m² (D-31): `1.25 ha`. */
export function formatHectares(m2: number | null | undefined, lang: Locale): string {
  const ha = typeof m2 === "number" ? m2 / M2_PER_HA : m2
  return formatQuantity(ha, "ha", lang, { maximumFractionDigits: 2 })
}
