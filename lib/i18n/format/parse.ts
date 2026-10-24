import type { Locale } from "../locales"

const SEPARATORS: Record<Locale, { decimal: string; group: string }> = {
  en: { decimal: ".", group: "," },
  de: { decimal: ",", group: "." },
}

const count = (text: string, char: string) => text.split(char).length - 1

/** `1.234.567` style grouping: a 1–3 digit head, then groups of exactly 3. */
function isGrouped(text: string, separator: string): boolean {
  const [head, ...groups] = text.split(separator)
  return /^\d{1,3}$/.test(head) && groups.length > 0 && groups.every((g) => /^\d{3}$/.test(g))
}

/**
 * Parses a typed number in either notation (D-21). Rules:
 * - spaces and apostrophes are ignored; `−` counts as a minus sign
 * - with both `.` and `,`, the last one is the decimal separator
 * - a repeated separator is a group separator (`1.234.567`)
 * - a single separator is decimal, unless it is the UI language's group separator
 *   followed by exactly three digits (`1.234` in DE = 1234, `1.234` in EN = 1.234)
 * Returns null for anything that is not a plain number.
 */
export function parseNumber(input: string, lang: Locale): number | null {
  let text = input.trim().replace(/[\s  ']/g, "").replace(/^[−–]/, "-")
  const sign = text.startsWith("-") ? -1 : 1
  text = text.replace(/^[+-]/, "")
  if (!/^[\d.,]+$/.test(text) || !/\d/.test(text)) return null

  const dots = count(text, ".")
  const commas = count(text, ",")
  let integer = text
  let fraction = ""

  if (dots > 0 && commas > 0) {
    const last = Math.max(text.lastIndexOf("."), text.lastIndexOf(","))
    const decimal = text[last]
    const group = decimal === "." ? "," : "."
    if (count(text, decimal) > 1) return null
    integer = text.slice(0, last)
    fraction = text.slice(last + 1)
    if (!isGrouped(integer, group)) return null
    integer = integer.split(group).join("")
  } else if (dots + commas > 1) {
    const separator = dots > 0 ? "." : ","
    if (!isGrouped(text, separator)) return null
    integer = text.split(separator).join("")
  } else if (dots + commas === 1) {
    const separator = dots > 0 ? "." : ","
    const [head, tail] = text.split(separator)
    const grouped = separator === SEPARATORS[lang].group && isGrouped(text, separator) && head !== "0"
    integer = grouped ? head + tail : head
    fraction = grouped ? "" : tail
  }

  if (!/^\d*$/.test(fraction)) return null
  const value = Number(`${integer || "0"}.${fraction || "0"}`)
  return Number.isFinite(value) ? sign * value : null
}
