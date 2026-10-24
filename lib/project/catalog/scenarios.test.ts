// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { SCENARIO_IDS } from "./scenarios"

const dir = path.resolve(__dirname, "../../../docs/20_business-models/00_scope/scenarios")

describe("scenarios", () => {
  it("offer every BM-SCN preset plus a custom use case (OQ-25)", () => {
    const ids = readdirSync(dir)
      .filter((file) => file.startsWith("scenario-"))
      .sort()
      .map((file) => readFileSync(path.join(dir, file), "utf8").match(/^id: (.+)$/m)?.[1].trim())
    expect(SCENARIO_IDS).toEqual([...ids, "custom"])
  })
})
