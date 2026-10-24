// @vitest-environment node
import { describe, expect, it } from "vitest"
import { confirmToken, readConfirmToken, tokenIdFor } from "./token"

const secret = new Uint8Array(32).fill(5)
const now = Date.UTC(2026, 9, 24, 12)
const inAWeek = Math.floor(now / 1000) + 7 * 86_400

describe("confirm tokens", () => {
  it("round-trip within their lifetime", async () => {
    const tokenId = await tokenIdFor(secret, "email-1")
    const token = await confirmToken(secret, tokenId, inAWeek)
    expect(token).toMatch(/^v1\.[A-Za-z0-9_-]{22}\.\d{10}\.[A-Za-z0-9_-]{43}$/)
    expect(await readConfirmToken(secret, token, now)).toEqual({ ok: true, tokenId })
  })

  it("expire", async () => {
    const token = await confirmToken(secret, await tokenIdFor(secret, "email-1"), inAWeek)
    expect(await readConfirmToken(secret, token, inAWeek * 1000)).toEqual({ ok: false, reason: "expired" })
  })

  it("refuse tampering, another secret and garbage", async () => {
    const tokenId = await tokenIdFor(secret, "email-1")
    const token = await confirmToken(secret, tokenId, inAWeek)
    const later = token.replace(`.${inAWeek}.`, `.${inAWeek + 86_400}.`)
    expect(await readConfirmToken(secret, later, now)).toEqual({ ok: false, reason: "invalid" })
    expect(await readConfirmToken(secret, token.replace(tokenId, await tokenIdFor(secret, "email-2")), now)).toEqual({ ok: false, reason: "invalid" })
    expect(await readConfirmToken(new Uint8Array(32).fill(6), token, now)).toEqual({ ok: false, reason: "invalid" })
    for (const bad of ["", "v1", "v2.a.b.c", `${token}x`, token.replace("v1", "v0")]) expect((await readConfirmToken(secret, bad, now)).ok).toBe(false)
  })

  it("derive one id per email, which only the secret can produce", async () => {
    expect(await tokenIdFor(secret, "email-1")).toBe(await tokenIdFor(secret, "email-1"))
    expect(await tokenIdFor(secret, "email-1")).not.toBe(await tokenIdFor(secret, "email-2"))
    expect(await tokenIdFor(new Uint8Array(32).fill(6), "email-1")).not.toBe(await tokenIdFor(secret, "email-1"))
    expect(await tokenIdFor(secret, "email-1")).toMatch(/^[A-Za-z0-9_-]{22}$/)
  })
})
