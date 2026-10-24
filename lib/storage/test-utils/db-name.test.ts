import { describe, expect, it } from "vitest"
import { uniqueDbName } from "./db-name"

describe("uniqueDbName (test helper)", () => {
  it("never repeats", () => {
    expect(uniqueDbName()).not.toBe(uniqueDbName())
    expect(uniqueDbName("x")).toMatch(/^first-move-x-/)
  })
})
