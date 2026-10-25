import type { Provider } from "../providers/types"
import { startIdleLock, type IdleLock } from "../vault/idle-lock"
import { rememberKey, unlockKey, type UnlockResult, type VaultOptions } from "../vault/vault"
import { KEYS } from "./registry"

/**
 * Between the vault and the key memory: a key opened with the PIN goes straight into memory
 * (no component ever holds it), and leaves it again after 30 minutes without use (D-50). A key
 * the user pastes or removes meanwhile ends the hold.
 */
const held = new Map<Provider, () => void>()
let lock: IdleLock | null = null

function release(provider: Provider) {
  held.get(provider)?.()
  held.delete(provider)
  if (held.size === 0) {
    lock?.stop()
    lock = null
  }
}

function lockAll() {
  lock = null
  for (const provider of [...held.keys()]) {
    release(provider)
    KEYS[provider].clear()
  }
}

function hold(provider: Provider) {
  release(provider)
  held.set(provider, KEYS[provider].subscribe(() => release(provider)))
  lock ??= startIdleLock(lockAll)
}

export type UnlockOutcome = Exclude<UnlockResult, { status: "ok" }> | { status: "ok" }

/** Opens the remembered key into memory. The result never carries the key. */
export async function unlockInto(provider: Provider, pin: string, options?: VaultOptions): Promise<UnlockOutcome> {
  const result = await unlockKey(provider, pin, options)
  if (result.status !== "ok") return result
  KEYS[provider].set(result.key)
  hold(provider)
  return { status: "ok" }
}

/**
 * Remembers the key now in memory under a PIN. False when there is no key in memory. From then
 * on the key in memory is under the idle lock too, as if it had been unlocked (D-50).
 */
export async function rememberCurrent(provider: Provider, pin: string, options?: VaultOptions): Promise<boolean> {
  const key = KEYS[provider].read()
  if (!key) return false
  await rememberKey(provider, key, pin, options)
  hold(provider)
  return true
}

/** Counts as use: restarts the idle countdown of keys opened from the vault. */
export function touchIdleLock(): void {
  lock?.touch()
}

/** Tests only: whether a provider's key in memory came from the vault. */
export function isHeld(provider: Provider): boolean {
  return held.has(provider)
}
