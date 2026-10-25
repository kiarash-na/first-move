import { afterEach, describe, expect, it, vi } from "vitest"
import { uniqueDbName } from "@/lib/storage/test-utils/db-name"
import { IDLE_LOCK_MS } from "../vault/idle-lock"
import { listVault, rememberKey, type VaultOptions } from "../vault/vault"
import { KEYS } from "./registry"
import { isHeld, rememberCurrent, touchIdleLock, unlockInto } from "./unlock"

const KEY = `sk-or-v1-${"7e".repeat(32)}`
const fresh = (): VaultOptions => ({ dbName: uniqueDbName("unlock"), iterations: 1000 })

afterEach(() => {
  vi.useRealTimers()
  KEYS.gateway.clear()
  KEYS.openrouter.clear()
})

describe("unlocking into memory (D-50)", () => {
  it("puts the key into memory and never returns it", async () => {
    const options = fresh()
    await rememberKey("openrouter", KEY, "482915", options)
    const result = await unlockInto("openrouter", "482915", options)
    expect(result).toEqual({ status: "ok" })
    expect(JSON.stringify(result)).not.toContain(KEY)
    expect(KEYS.openrouter.read()).toBe(KEY)
    expect(isHeld("openrouter")).toBe(true)
  })

  it("reports a wrong PIN with the attempts left and keeps memory empty", async () => {
    const options = fresh()
    await rememberKey("openrouter", KEY, "482915", options)
    expect(await unlockInto("openrouter", "482916", options)).toEqual({ status: "wrong", remaining: 4 })
    expect(KEYS.openrouter.read()).toBeNull()
  })

  it("drops an unlocked key after 30 minutes without use, but keeps it in the vault", async () => {
    const options = fresh()
    await rememberKey("gateway", "vck_vault_key_abcdefghijklmnop9999", "482915", options)
    await unlockInto("gateway", "482915", options)
    vi.useFakeTimers()
    // The lock started before the fake timers; touching re-arms it on the fake clock.
    touchIdleLock()
    vi.advanceTimersByTime(IDLE_LOCK_MS - 1)
    expect(KEYS.gateway.read()).not.toBeNull()
    vi.advanceTimersByTime(1)
    expect(KEYS.gateway.read()).toBeNull()
    expect(isHeld("gateway")).toBe(false)
    vi.useRealTimers()
    expect(await listVault(options)).toHaveLength(1)
  })

  it("leaves a key the user pasted afterwards alone", async () => {
    const options = fresh()
    await rememberKey("openrouter", KEY, "482915", options)
    await unlockInto("openrouter", "482915", options)
    KEYS.openrouter.set(`sk-or-v1-${"1a".repeat(32)}`)
    expect(isHeld("openrouter")).toBe(false)
  })

  it("remembers the key in memory under a PIN", async () => {
    const options = fresh()
    expect(await rememberCurrent("openrouter", "482915", options)).toBe(false)
    KEYS.openrouter.set(KEY)
    expect(await rememberCurrent("openrouter", "482915", options)).toBe(true)
    expect((await listVault(options))[0]).toMatchObject({ provider: "openrouter", last4: KEY.slice(-4) })
  })

  it("puts a key it just remembered under the idle lock in this tab", async () => {
    const options = fresh()
    KEYS.openrouter.set(KEY)
    expect(await rememberCurrent("openrouter", "482915", options)).toBe(true)
    expect(isHeld("openrouter")).toBe(true)
    vi.useFakeTimers()
    touchIdleLock()
    vi.advanceTimersByTime(IDLE_LOCK_MS)
    expect(KEYS.openrouter.read()).toBeNull()
    expect(isHeld("openrouter")).toBe(false)
    vi.useRealTimers()
    expect(await listVault(options)).toHaveLength(1)
  })
})
