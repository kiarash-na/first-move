/**
 * A key held in module memory for the open tab (D-50 "session", the default): never in storage,
 * the URL, React state that persists, a log, an export or an error text; a reload forgets it.
 * Components read only the masked form (`…1234`).
 */
export interface KeyMemory {
  set(value: string): void
  clear(): void
  /** For the provider client only. */
  read(): string | null
  masked(): string | null
  subscribe(listener: () => void): () => void
}

export function createKeyMemory(): KeyMemory {
  let key: string | null = null
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())
  return {
    set(value) {
      key = value.trim()
      notify()
    },
    clear() {
      key = null
      notify()
    },
    read: () => key,
    masked: () => (key ? `…${key.slice(-4)}` : null),
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
