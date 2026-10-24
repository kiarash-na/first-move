/**
 * Fills `{name}` placeholders of a dictionary string (`"Saved {time}"`). Unknown placeholders
 * stay as written, so a missing value is visible instead of silently empty.
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : match,
  )
}
