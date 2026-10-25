/**
 * A short, stable fingerprint of any JSON value (FNV-1a, 32 bit, as 8 hex digits), so slide 3
 * can show that the same inputs give the same result. Object keys are sorted first, so key order
 * never changes it. Not a security hash.
 */
export function fingerprint(value: unknown): string {
  const text = stableStringify(value)
  let hash = 0x811c9dc5
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, "0")
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`).join(",")}}`
  }
  return JSON.stringify(value) ?? "null"
}
