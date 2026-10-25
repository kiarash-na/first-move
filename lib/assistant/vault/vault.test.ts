import { openDB } from "idb"
import { describe, expect, it } from "vitest"
import { uniqueDbName } from "@/lib/storage/test-utils/db-name"
import { DEVICE_KEY, VAULT_DB_NAME } from "./db"
import { forgetKey, listVault, MAX_ATTEMPTS, rememberKey, unlockKey, type VaultOptions } from "./vault"

const KEY = "sk-or-v1-0123456789abcdef0123456789abcdefSECRET9f2c"
const PIN = "482915"

/** A fresh database per test and a cheap derivation; the real count is pinned in `crypto.test.ts`. */
const fresh = (): VaultOptions => ({ dbName: uniqueDbName("vault"), iterations: 1000, now: () => new Date("2026-10-25T08:00:00.000Z") })

async function rawRecords(dbName: string) {
  const db = await openDB(dbName)
  const records = await db.getAll("vault")
  const device = await db.get("device", DEVICE_KEY)
  db.close()
  return { records, device: device as CryptoKey }
}

describe("key vault (D-50)", () => {
  it("lives in its own database, apart from the project database", () => {
    expect(VAULT_DB_NAME).toBe("first-move-assistant")
  })

  it("remembers a key and opens it again with the PIN", async () => {
    const options = fresh()
    await rememberKey("openrouter", KEY, PIN, options)
    expect(await listVault(options)).toEqual([{ provider: "openrouter", last4: "9f2c", createdAt: "2026-10-25T08:00:00.000Z", failedAttempts: 0 }])
    expect(await unlockKey("openrouter", PIN, options)).toEqual({ status: "ok", key: KEY })
    expect(await unlockKey("gateway", PIN, options)).toEqual({ status: "missing" })
  })

  it("stores only ciphertext and a non-extractable device key", async () => {
    const options = fresh()
    await rememberKey("gateway", KEY, PIN, options)
    const { records, device } = await rawRecords(options.dbName!)
    const stored = JSON.stringify(records, (_, value) => (value instanceof Uint8Array ? new TextDecoder().decode(value) : value))
    expect(stored).not.toContain("SECRET")
    expect(stored).not.toContain(PIN)
    expect(records[0]).toMatchObject({ v: 1, provider: "gateway", last4: "9f2c", failedAttempts: 0 })
    expect(records[0].salt).toHaveLength(16)
    expect(device.extractable).toBe(false)
    await expect(crypto.subtle.exportKey("raw", device)).rejects.toThrow()
  })

  it("counts wrong PINs and resets the count after the right one", async () => {
    const options = fresh()
    await rememberKey("openrouter", KEY, PIN, options)
    expect(await unlockKey("openrouter", "000001", options)).toEqual({ status: "wrong", remaining: MAX_ATTEMPTS - 1 })
    expect(await unlockKey("openrouter", "000002", options)).toEqual({ status: "wrong", remaining: MAX_ATTEMPTS - 2 })
    expect((await listVault(options))[0].failedAttempts).toBe(2)
    expect(await unlockKey("openrouter", PIN, options)).toEqual({ status: "ok", key: KEY })
    expect((await listVault(options))[0].failedAttempts).toBe(0)
  })

  it("deletes the key at the fifth wrong PIN in a row", async () => {
    const options = fresh()
    await rememberKey("openrouter", KEY, PIN, options)
    for (let attempt = 1; attempt < MAX_ATTEMPTS; attempt++) {
      expect(await unlockKey("openrouter", "135790", options)).toEqual({ status: "wrong", remaining: MAX_ATTEMPTS - attempt })
    }
    expect(await unlockKey("openrouter", "135790", options)).toEqual({ status: "wiped" })
    expect(await listVault(options)).toEqual([])
    expect(await unlockKey("openrouter", PIN, options)).toEqual({ status: "missing" })
  })

  it("deletes a record the device key cannot open", async () => {
    const options = fresh()
    await rememberKey("gateway", KEY, PIN, options)
    const db = await openDB(options.dbName!)
    await db.put("device", await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]), DEVICE_KEY)
    db.close()
    expect(await unlockKey("gateway", PIN, options)).toEqual({ status: "wiped" })
    expect(await listVault(options)).toEqual([])
  })

  it("replaces an older key of the same provider and keeps the other provider's", async () => {
    const options = fresh()
    await rememberKey("gateway", "vck_first_key_abcdefghijklmnop1111", PIN, options)
    await rememberKey("openrouter", KEY, "736251", options)
    await rememberKey("gateway", "vck_second_key_abcdefghijklmnop2222", "918273", options)
    expect((await listVault(options)).map((entry) => [entry.provider, entry.last4])).toEqual([
      ["gateway", "2222"],
      ["openrouter", "9f2c"],
    ])
    expect(await unlockKey("gateway", "918273", options)).toEqual({ status: "ok", key: "vck_second_key_abcdefghijklmnop2222" })
    expect(await unlockKey("openrouter", "736251", options)).toEqual({ status: "ok", key: KEY })
  })

  it("forgets a key on demand and refuses a malformed PIN", async () => {
    const options = fresh()
    await expect(rememberKey("gateway", KEY, "12345", options)).rejects.toThrow()
    await rememberKey("gateway", KEY, PIN, options)
    await forgetKey("gateway", options)
    expect(await listVault(options)).toEqual([])
  })

  it("never creates its database by looking: only remembering a key does", async () => {
    const options = fresh()
    const exists = async () => (await indexedDB.databases()).some((database) => database.name === options.dbName)
    expect(await listVault(options)).toEqual([])
    expect(await unlockKey("gateway", PIN, options)).toEqual({ status: "missing" })
    await forgetKey("gateway", options)
    expect(await exists()).toBe(false)
    await rememberKey("gateway", KEY, PIN, options)
    expect(await exists()).toBe(true)
    expect(await listVault(options)).toHaveLength(1)
  })
})
