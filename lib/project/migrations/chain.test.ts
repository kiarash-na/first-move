// @vitest-environment node
import { describe, expect, it } from "vitest"
import { SCHEMA_VERSION } from "@/lib/project/versions"
import { MIGRATIONS } from "./chain"

describe("migration chain", () => {
  it("has one step per version, from the v1 baseline up to SCHEMA_VERSION", () => {
    expect(MIGRATIONS.map((migration) => migration.version)).toEqual(
      Array.from({ length: SCHEMA_VERSION }, (_, index) => index + 1),
    )
    expect(MIGRATIONS.every((migration) => migration.description.length > 0)).toBe(true)
  })
})
