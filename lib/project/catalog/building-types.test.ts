// @vitest-environment node
import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { parse } from "yaml"
import { BUILDING_TYPES, INDUSTRY } from "./building-types"

const reference = path.resolve(__dirname, "../../../docs/10_quick-check-tool/_reference")
const readYaml = (file: string) => parse(readFileSync(path.join(reference, file), "utf8"))

describe("building types", () => {
  it("match QCT-REF-TYPES in order", () => {
    const yaml = readYaml("building-types.yaml")
    expect(BUILDING_TYPES).toEqual(yaml.types.map((type: { key: string }) => type.key))
  })

  it("match the rows of TBL-1..3", () => {
    for (const file of [
      "table-01_annual-heating-demand.yaml",
      "table-02_annual-cooling-demand.yaml",
      "table-03_average-floor-area.yaml",
    ]) {
      expect(Object.keys(readYaml(file).rows), file).toEqual([...BUILDING_TYPES])
    }
  })

  it("marks industry, the row without defaults (OQ-02)", () => {
    const yaml = readYaml("table-01_annual-heating-demand.yaml")
    expect(yaml.rows[INDUSTRY].value.every((value: unknown) => value === null)).toBe(true)
  })
})
