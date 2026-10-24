/**
 * Splits a formatted quantity such as `1.23 GWh/a` or `12,5 m` into the number and its unit, so a
 * large figure can show the unit smaller. Text without a space (`€1.2M`, `126%`) has no unit part.
 */
export function splitUnit(text: string): { number: string; unit: string } {
  const match = /^(\S+)[\s  ](.+)$/u.exec(text)
  return match ? { number: match[1], unit: match[2] } : { number: text, unit: "" }
}
