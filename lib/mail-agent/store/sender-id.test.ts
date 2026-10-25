// @vitest-environment node
import { describe, expect, it } from "vitest"
import { domainId, domainOf, emailAddress, normalizeAddress, senderId } from "./sender-id"

const secret = new Uint8Array(32).fill(3)

describe("emailAddress", () => {
  it("reads the address of a From field", () => {
    expect(emailAddress("First Move spike <Spike@Mail.FirstMove.Energy>")).toBe("spike@mail.firstmove.energy")
    expect(emailAddress("jane@example.org")).toBe("jane@example.org")
    expect(emailAddress('"Doe, Jane" <jane@example.org> ')).toBe("jane@example.org")
  })

  it("rejects what is not an address", () => {
    for (const bad of ["", "Jane", "<>", "jane@", "@example.org", "jane@example", "a b@example.org", `${"x".repeat(250)}@e.de`]) expect(emailAddress(bad)).toBeNull()
  })

  it("rejects list separators in the address, so a parsed From can never carry two recipients", () => {
    for (const bad of ["a@b.c,d.e", "a@b.c;d.e", "a@b.c, d@e.f"]) expect(emailAddress(bad)).toBeNull()
  })
})

describe("normalizeAddress", () => {
  it("drops +tags and case, and folds Gmail variants", () => {
    expect(normalizeAddress("Jane+firstmove@Example.org")).toBe("jane@example.org")
    expect(normalizeAddress("j.a.n.e+x@googlemail.com")).toBe("jane@gmail.com")
    expect(normalizeAddress("j.ane@example.org")).toBe("j.ane@example.org")
    expect(domainOf("Jane@Sub.Example.org")).toBe("sub.example.org")
  })
})

describe("senderId", () => {
  it("is one id per mailbox, unrelated to the address", async () => {
    const id = await senderId(secret, "jane@gmail.com")
    expect(id).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(await senderId(secret, "J.Ane+tag@googlemail.com")).toBe(id)
    expect(await senderId(secret, "john@gmail.com")).not.toBe(id)
    expect(await senderId(new Uint8Array(32).fill(4), "jane@gmail.com")).not.toBe(id)
    expect(id).not.toContain("jane")
  })

  it("keeps sender and domain ids apart", async () => {
    expect(await domainId(secret, "a@example.org")).toBe(await domainId(secret, "b@example.org"))
    expect(await domainId(secret, "a@example.org")).not.toBe(await senderId(secret, "a@example.org"))
  })
})
