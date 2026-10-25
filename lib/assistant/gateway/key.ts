/**
 * The user's Vercel AI Gateway key for the AI Plan Score (D-71): held in this module's memory
 * only, for the open tab. Never in storage, the URL, React state that persists, a log, an export
 * or an error text; a reload forgets it. Components read only the masked form.
 */
let key: string | null = null
const listeners = new Set<() => void>()

/** Gateway keys are opaque; this only rejects what cannot be one (blank, spaces, absurd length). */
export function isPlausibleGatewayKey(value: string): boolean {
  const trimmed = value.trim()
  return trimmed.length >= 20 && trimmed.length <= 400 && !/\s/.test(trimmed)
}

export function setGatewayKey(value: string): void {
  key = value.trim()
  listeners.forEach((listener) => listener())
}

export function clearGatewayKey(): void {
  key = null
  listeners.forEach((listener) => listener())
}

/** For the Gateway client only. */
export function readGatewayKey(): string | null {
  return key
}

/** What the UI may show: the last four characters. */
export function maskedGatewayKey(): string | null {
  return key ? `…${key.slice(-4)}` : null
}

export function subscribeGatewayKey(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
