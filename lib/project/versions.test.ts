// @vitest-environment node
import { describe, expect, it } from "vitest"
import { METHODOLOGY_VERSION, SCHEMA_VERSION } from "./versions"

describe("versions", () => {
  it("is at schema version 2 (provenance, PLAN-AGENT-01)", () => {
    expect(SCHEMA_VERSION).toBe(2)
  })

  it("uses a semantic methodology version", () => {
    expect(METHODOLOGY_VERSION).toMatch(/^\d+\.\d+\.\d+$/)
  })
})
