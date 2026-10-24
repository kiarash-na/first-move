// @vitest-environment node
import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { parse } from "yaml"
import { CAPACITY_CELLS } from "./potentials"
import { hasCell, SOURCE_CELLS, SOURCES, type Application } from "./sources"

const reference = path.resolve(__dirname, "../../../docs/10_quick-check-tool/_reference")
const tables: Record<Application, string> = {
  heating: "table-04_heating-capacity-per-source.yaml",
  cooling: "table-05_cooling-capacity-per-source.yaml",
}

describe("sources", () => {
  it.each(Object.entries(tables) as [Application, string][])("match the rows and dashes of %s", (application, file) => {
    const yaml = parse(readFileSync(path.join(reference, file), "utf8"))
    expect(Object.keys(yaml.rows)).toEqual([...SOURCES])
    for (const source of SOURCES) {
      const withValue = CAPACITY_CELLS.filter((cell) => yaml.rows[source][cell] !== null)
      expect(SOURCE_CELLS[source][application], `${source} ${application}`).toEqual(withValue)
    }
  })

  it("answers whether a cell has a default (OQ-13)", () => {
    expect(hasCell("solar_thermal", "heating", "high")).toBe(true)
    expect(hasCell("solar_thermal", "heating", "cop")).toBe(false)
    expect(hasCell("waste_heat", "cooling", "low")).toBe(false)
    expect(hasCell("ambient_air", "cooling", "cop")).toBe(true)
  })

  it("has an installation cost row in TBL-6 for every source", () => {
    const yaml = parse(readFileSync(path.join(reference, "table-06_economic-parameters.yaml"), "utf8"))
    const keys = yaml.parameters.map((parameter: { key: string }) => parameter.key)
    for (const source of SOURCES) expect(keys).toContain(`installation_costs_${source}`)
  })
})
