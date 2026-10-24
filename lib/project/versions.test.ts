// @vitest-environment node
import { describe, expect, it } from "vitest"
import { METHODOLOGY_VERSION, SCHEMA_VERSION } from "./versions"

describe("versions", () => {
  it("starts the schema at version 1", () => {
    expect(SCHEMA_VERSION).toBe(1)
  })

  it("uses a semantic methodology version", () => {
    expect(METHODOLOGY_VERSION).toMatch(/^\d+\.\d+\.\d+$/)
  })
})
