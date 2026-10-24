/**
 * Collects values an equation could not compute (a zero denominator from a parameter the
 * schema already forbids, e.g. COP = 1 or a depreciation period of 0). `run` then reports the
 * project as incomplete with those field ids instead of showing a wrong number.
 */
export interface Guard {
  /** The value, or 0 after recording `fieldId` when it is null. */
  need(value: number | null, fieldId: string): number
  readonly invalid: readonly string[]
}

export function createGuard(): Guard {
  const invalid: string[] = []
  return {
    need(value, fieldId) {
      if (value !== null) return value
      if (!invalid.includes(fieldId)) invalid.push(fieldId)
      return 0
    },
    invalid,
  }
}
