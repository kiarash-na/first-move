import { isPlainObject } from "./deep-merge"

/** Key paths (`a.b.c`) present in `other` but not in `base`, or of a different kind. */
export function extraKeys(base: unknown, other: unknown, prefix = ""): string[] {
  if (!isPlainObject(other)) return []
  const baseObject = isPlainObject(base) ? base : {}
  return Object.entries(other).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (!(key in baseObject)) return [path]
    const baseValue = baseObject[key]
    if (isPlainObject(value) !== isPlainObject(baseValue)) return [path]
    return isPlainObject(value) ? extraKeys(baseValue, value, path) : []
  })
}

/** Leaf key paths of `base` that `other` does not provide (the DE to-do list, D-32). */
export function missingKeys(base: unknown, other: unknown, prefix = ""): string[] {
  if (!isPlainObject(base)) return []
  const otherObject = isPlainObject(other) ? other : {}
  return Object.entries(base).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (isPlainObject(value)) return missingKeys(value, otherObject[key], path)
    const otherValue = otherObject[key]
    return otherValue === undefined || otherValue === "" ? [path] : []
  })
}
