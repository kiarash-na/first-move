type PlainObject = Record<string, unknown>

export function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Overlays `override` on `base` (D-32: DE over EN). The base defines the shape:
 * keys the base lacks are ignored, a value of a different kind is ignored, and an
 * empty string counts as missing, so the base value is kept.
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) return base
  const result: PlainObject = { ...base }
  for (const [key, baseValue] of Object.entries(base)) {
    if (!(key in override)) continue
    const value = override[key]
    if (isPlainObject(baseValue)) {
      result[key] = deepMerge(baseValue, value)
    } else if (typeof baseValue === "string") {
      if (typeof value === "string" && value !== "") result[key] = value
    } else if (Array.isArray(baseValue)) {
      if (Array.isArray(value)) result[key] = value
    } else if (typeof value === typeof baseValue) {
      result[key] = value
    }
  }
  return result as T
}
