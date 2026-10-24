// @vitest-environment node
import { describe, expect, it } from "vitest"
import { open, seal } from "./crypto"

const secret = new Uint8Array(32).fill(7)
const other = new Uint8Array(32).fill(8)

describe("seal and open (AES-256-GCM)", () => {
  it("round-trips a record and hides its content", async () => {
    const sealed = await seal(secret, "fm:mail:pending:sid1", "Hello, 120 buildings")
    expect(sealed).toMatch(/^v1\.[A-Za-z0-9_-]{16}\.[A-Za-z0-9_-]+$/)
    expect(sealed).not.toContain("buildings")
    expect(await open(secret, "fm:mail:pending:sid1", sealed)).toBe("Hello, 120 buildings")
  })

  it("uses a fresh IV for every record", async () => {
    expect(await seal(secret, "k", "same")).not.toBe(await seal(secret, "k", "same"))
  })

  it("refuses another key name, another secret, tampering and unknown envelopes", async () => {
    const sealed = await seal(secret, "fm:mail:conv:a", "state")
    expect(await open(secret, "fm:mail:conv:b", sealed)).toBeNull()
    expect(await open(other, "fm:mail:conv:a", sealed)).toBeNull()
    const [version, iv, data] = sealed.split(".")
    const flipped = `${data.slice(0, -2)}${data.at(-2) === "A" ? "B" : "A"}${data.at(-1)}`
    expect(await open(secret, "fm:mail:conv:a", `${version}.${iv}.${flipped}`)).toBeNull()
    expect(await open(secret, "fm:mail:conv:a", `v2.${iv}.${data}`)).toBeNull()
    expect(await open(secret, "fm:mail:conv:a", "not an envelope")).toBeNull()
  })
})
