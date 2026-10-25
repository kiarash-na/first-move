import { describe, expect, it } from "vitest"
import { createDeviceKey, derivePinKey, fromUtf8, PBKDF2_ITERATIONS, randomBytes, SALT_BYTES, seal, unseal, utf8 } from "./crypto"

describe("vault cryptography (D-50)", () => {
  it("uses PBKDF2-SHA-256 with 600,000 iterations and a 16-byte salt", () => {
    expect(PBKDF2_ITERATIONS).toBe(600_000)
    expect(SALT_BYTES).toBe(16)
  })

  it("seals and opens with the same key and associated data", async () => {
    const key = await derivePinKey("482915", randomBytes(SALT_BYTES), 1000)
    const sealed = await seal(key, utf8("sk-or-v1-secret"), utf8("v1:openrouter"))
    expect(fromUtf8(sealed.data)).not.toContain("secret")
    expect(fromUtf8(await unseal(key, sealed, utf8("v1:openrouter")))).toBe("sk-or-v1-secret")
  })

  it("fails with another PIN, another salt or other associated data", async () => {
    const salt = randomBytes(SALT_BYTES)
    const sealed = await seal(await derivePinKey("482915", salt, 1000), utf8("x"), utf8("v1:gateway"))
    await expect(unseal(await derivePinKey("482916", salt, 1000), sealed, utf8("v1:gateway"))).rejects.toThrow()
    await expect(unseal(await derivePinKey("482915", randomBytes(SALT_BYTES), 1000), sealed, utf8("v1:gateway"))).rejects.toThrow()
    await expect(unseal(await derivePinKey("482915", salt, 1000), sealed, utf8("v1:openrouter"))).rejects.toThrow()
  })

  it("never lets anyone export the derived or the device key", async () => {
    const pinKey = await derivePinKey("482915", randomBytes(SALT_BYTES), 1000)
    const device = await createDeviceKey()
    for (const key of [pinKey, device]) {
      expect(key.extractable).toBe(false)
      await expect(crypto.subtle.exportKey("raw", key)).rejects.toThrow()
    }
  })
})
