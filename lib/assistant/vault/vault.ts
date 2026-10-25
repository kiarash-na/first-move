import type { IDBPDatabase } from "idb"
import type { Provider } from "../providers/types"
import { createDeviceKey, derivePinKey, fromUtf8, PBKDF2_ITERATIONS, randomBytes, SALT_BYTES, seal, unseal, utf8 } from "./crypto"
import { DEVICE_KEY, openVaultDb, VAULT_DB_NAME, type VaultDb, type VaultRecord } from "./db"
import { isPinFormat } from "./pin"

/** Wrong PINs in a row after which the remembered key is deleted (D-50). */
export const MAX_ATTEMPTS = 5

export interface VaultOptions {
  /** Tests only: another database name and a cheaper derivation. */
  dbName?: string
  iterations?: number
  now?: () => Date
}

/** What may be shown about a remembered key without the PIN. */
export interface VaultEntry {
  provider: Provider
  last4: string
  createdAt: string
  failedAttempts: number
}

export type UnlockResult =
  | { status: "ok"; key: string }
  | { status: "wrong"; remaining: number }
  /** Five wrong PINs, or a record that no longer opens: it is deleted. */
  | { status: "wiped" }
  | { status: "missing" }
  | { status: "unavailable" }

/** Associated data of both layers: the record version and the provider. */
const aad = (provider: Provider) => utf8(`${VAULT_DB_NAME}:v1:${provider}`)

/** Runs `work` on the database; reads pass `create: false`, so they never create it. */
async function withDb<T>(options: VaultOptions & { create?: boolean }, fallback: T, work: (db: IDBPDatabase<VaultDb>) => Promise<T>): Promise<T> {
  const db = await openVaultDb(options.dbName, { create: options.create ?? false })
  if (!db) return fallback
  try {
    return await work(db)
  } finally {
    db.close()
  }
}

/** The device key of this browser profile, created on first use. */
async function deviceKey(db: IDBPDatabase<VaultDb>): Promise<CryptoKey> {
  const existing = await db.get("device", DEVICE_KEY)
  if (existing) return existing
  const created = await createDeviceKey()
  // `add` fails if another tab created one meanwhile; that one wins.
  try {
    await db.add("device", created, DEVICE_KEY)
    return created
  } catch {
    return (await db.get("device", DEVICE_KEY))!
  }
}

/** The remembered keys of this browser, without anything secret. */
export function listVault(options: VaultOptions = {}): Promise<VaultEntry[]> {
  return withDb(options, [], async (db) =>
    (await db.getAll("vault")).map(({ provider, last4, createdAt, failedAttempts }) => ({ provider, last4, createdAt, failedAttempts })),
  )
}

/**
 * Remembers a key on this device under a six-digit PIN (D-50). The caller checked the PIN rules
 * (`pinProblem`); a malformed PIN is refused here too. Replaces an older record of the provider.
 * Throws when the browser cannot keep it (no IndexedDB).
 */
export async function rememberKey(provider: Provider, key: string, pin: string, options: VaultOptions = {}): Promise<void> {
  if (!isPinFormat(pin)) throw new Error("The PIN must be six digits")
  const saved = await withDb({ ...options, create: true }, false, async (db) => {
    const salt = randomBytes(SALT_BYTES)
    const inner = await seal(await derivePinKey(pin, salt, options.iterations ?? PBKDF2_ITERATIONS), utf8(key), aad(provider))
    const outer = await seal(await deviceKey(db), inner.data, aad(provider))
    const record: VaultRecord = {
      v: 1,
      provider,
      salt,
      iv1: inner.iv,
      iv2: outer.iv,
      ct: outer.data,
      last4: key.slice(-4),
      failedAttempts: 0,
      createdAt: (options.now?.() ?? new Date()).toISOString(),
    }
    await db.put("vault", record, provider)
    return true
  })
  if (!saved) throw new Error("This browser cannot keep the key")
}

/**
 * Opens a remembered key with the PIN. A wrong PIN counts; the fifth in a row deletes the record.
 * A record the device key cannot open (another profile, damage) is deleted too.
 */
export function unlockKey(provider: Provider, pin: string, options: VaultOptions = {}): Promise<UnlockResult> {
  // No database means nothing was remembered here; no IndexedDB at all means it cannot be.
  const absent: UnlockResult = typeof indexedDB === "undefined" ? { status: "unavailable" } : { status: "missing" }
  return withDb<UnlockResult>(options, absent, async (db) => {
    const record = await db.get("vault", provider)
    if (!record) return { status: "missing" }
    let inner: Uint8Array<ArrayBuffer>
    try {
      inner = await unseal(await deviceKey(db), { iv: record.iv2, data: record.ct }, aad(provider))
    } catch {
      await db.delete("vault", provider)
      return { status: "wiped" }
    }
    try {
      const pinKey = await derivePinKey(pin, record.salt, options.iterations ?? PBKDF2_ITERATIONS)
      const key = fromUtf8(await unseal(pinKey, { iv: record.iv1, data: inner }, aad(provider)))
      if (record.failedAttempts > 0) await db.put("vault", { ...record, failedAttempts: 0 }, provider)
      return { status: "ok", key }
    } catch {
      const current = await db.get("vault", provider)
      if (!current) return { status: "missing" }
      const failedAttempts = current.failedAttempts + 1
      if (failedAttempts >= MAX_ATTEMPTS) {
        await db.delete("vault", provider)
        return { status: "wiped" }
      }
      await db.put("vault", { ...current, failedAttempts }, provider)
      return { status: "wrong", remaining: MAX_ATTEMPTS - failedAttempts }
    }
  })
}

/** Deletes a remembered key ("Remove key"). */
export function forgetKey(provider: Provider, options: VaultOptions = {}): Promise<void> {
  return withDb(options, undefined, async (db) => {
    await db.delete("vault", provider)
  })
}
