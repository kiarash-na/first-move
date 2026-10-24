// @vitest-environment node
import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { parse } from "yaml"
import { CAPACITY_CELLS, CAPACITY_LEVELS, POTENTIALS } from "./potentials"

const reference = path.resolve(__dirname, "../../../docs/10_quick-check-tool/_reference")

describe("potentials", () => {
  it("offers Low, Medium, High and Unknown (QCT-IN-07)", () => {
    expect(POTENTIALS).toEqual(["low", "medium", "high", "unknown"])
  })

  it("has one capacity column per level, then the COP (TBL-4/5)", () => {
    for (const file of ["table-04_heating-capacity-per-source.yaml", "table-05_cooling-capacity-per-source.yaml"]) {
      const yaml = parse(readFileSync(path.join(reference, file), "utf8"))
      expect(CAPACITY_CELLS.map((cell) => cell.toUpperCase()), file).toEqual(
        yaml.columns.map((column: string) => column.toUpperCase()),
      )
    }
    expect(CAPACITY_LEVELS).not.toContain("unknown")
  })
})
