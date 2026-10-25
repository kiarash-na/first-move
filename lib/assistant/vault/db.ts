import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { Provider } from "../providers/types"

/**
 * The assistant's own IndexedDB database (D-50), separate from the project database
 * `first-move`, so an export, a snapshot or the localStorage mirror can never contain it.
 */
export const VAULT_DB_NAME = "first-move-assistant"
export const VAULT_DB_VERSION = 1

/** One remembered key, sealed twice (`crypto.ts`). Only `last4` is readable without the PIN. */
export interface VaultRecord {
  v: 1
  provider: Provider
  salt: Uint8Array<ArrayBuffer>
  /** IV of the inner (PIN) layer; its ciphertext is the plaintext of the outer layer. */
  iv1: Uint8Array<ArrayBuffer>
  /** IV and ciphertext of the outer (device key) layer. */
  iv2: Uint8Array<ArrayBuffer>
  ct: Uint8Array<ArrayBuffer>
  last4: string
  failedAttempts: number
  createdAt: string
}

export interface VaultDb extends DBSchema {
  /** Remembered keys by provider. */
  vault: { key: Provider; value: VaultRecord }
  /** The non-extractable device key under `DEVICE_KEY`. */
  device: { key: string; value: CryptoKey }
}

export const DEVICE_KEY = "device"

/**
 * Opens the database, or null when this browser has no usable IndexedDB (some private modes).
 * With `create: false` (every read) it is also null while the database does not exist: the
 * upgrade that would create it is aborted, so looking for a remembered key leaves nothing behind.
 * Only remembering a key creates it.
 */
export async function openVaultDb(name = VAULT_DB_NAME, { create = true }: { create?: boolean } = {}): Promise<IDBPDatabase<VaultDb> | null> {
  if (typeof indexedDB === "undefined") return null
  try {
    return await openDB<VaultDb>(name, VAULT_DB_VERSION, {
      upgrade(database, oldVersion, _newVersion, transaction) {
        if (oldVersion === 0 && !create) {
          transaction.done.catch(() => {})
          transaction.abort()
          return
        }
        database.createObjectStore("vault")
        database.createObjectStore("device")
      },
    })
  } catch {
    return null
  }
}
