/**
 * localStorage or sessionStorage, or null when the browser blocks it (private mode, sandboxed
 * frames, disabled cookies) or on the server. Client only, outside render.
 */
export function getWebStorage(kind: "local" | "session"): Storage | null {
  try {
    if (typeof window === "undefined") return null
    return (kind === "local" ? window.localStorage : window.sessionStorage) ?? null
  } catch {
    return null
  }
}

const PROBE_KEY = "first-move:probe"

/**
 * The storage if it accepts writes, else null. Some browsers expose a storage object whose every
 * write throws (old private modes). Client only, outside render.
 */
export function usableWebStorage(kind: "local" | "session"): Storage | null {
  const storage = getWebStorage(kind)
  if (!storage || !writeKey(storage, PROBE_KEY, "1")) return null
  removeKey(storage, PROBE_KEY)
  return storage
}

/** Reads a key; null when missing or when storage throws. */
export function readKey(storage: Storage | null, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null
  } catch {
    return null
  }
}

/** Writes a key; false when storage is missing or throws (quota, blocked). */
export function writeKey(storage: Storage | null, key: string, value: string): boolean {
  if (!storage) return false
  try {
    storage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/** Removes a key, ignoring errors. */
export function removeKey(storage: Storage | null, key: string): void {
  try {
    storage?.removeItem(key)
  } catch {
    // Nothing to clean up when storage is blocked.
  }
}

/** True for the browser's "storage is full" error (name differs between engines). */
export function isQuotaError(error: unknown): boolean {
  const name = errorName(error)
  return name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED"
}

/** The `name` of an Error or DOMException, or null. */
export function errorName(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("name" in error)) return null
  return typeof error.name === "string" ? error.name : null
}
