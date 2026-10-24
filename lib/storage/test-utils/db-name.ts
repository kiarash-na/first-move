let counter = 0

/** Test helper: a fresh IndexedDB name per test (fake-indexeddb is shared within a test file). */
export function uniqueDbName(label = "test"): string {
  counter++
  return `first-move-${label}-${counter}-${Math.random().toString(36).slice(2)}`
}
