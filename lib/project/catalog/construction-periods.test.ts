// @vitest-environment node
import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { parse } from "yaml"
import { CONSTRUCTION_PERIODS, PERIOD_COLUMNS } from "./construction-periods"

const reference = path.resolve(__dirname, "../../../docs/10_quick-check-tool/_reference")

describe("construction periods", () => {
  it("map in order onto the printed columns of TBL-1..3 (OQ-03)", () => {
    for (const file of [
      "table-01_annual-heating-demand.yaml",
      "table-02_annual-cooling-demand.yaml",
      "table-03_average-floor-area.yaml",
    ]) {
      const yaml = parse(readFileSync(path.join(reference, file), "utf8"))
      expect(CONSTRUCTION_PERIODS.map((period) => PERIOD_COLUMNS[period]), file).toEqual(yaml.columns)
    }
  })
})
