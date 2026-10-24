// @vitest-environment node
import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { parse } from "yaml"
import { ECONOMIC_PARAMETER_INFO, ECONOMIC_PARAMETERS } from "./economic-parameters"

const file = path.resolve(__dirname, "../../../docs/10_quick-check-tool/_reference/table-06_economic-parameters.yaml")
const yaml = parse(readFileSync(file, "utf8")) as {
  parameters: { key: string; unit: string; symbol?: string; flags?: string[] }[]
}

describe("economic parameters", () => {
  it("list the rows of TBL-6 in order", () => {
    expect(ECONOMIC_PARAMETERS).toEqual(yaml.parameters.map((parameter) => parameter.key))
  })

  it.each(yaml.parameters)("keep the unit, symbol and flags of $key", (parameter) => {
    const info = ECONOMIC_PARAMETER_INFO[parameter.key as keyof typeof ECONOMIC_PARAMETER_INFO]
    expect(info.unit).toBe(parameter.unit)
    expect(info.symbol).toBe(parameter.symbol ?? null)
    expect(info.flags).toEqual(parameter.flags ?? [])
    expect(info.feeds.length).toBeGreaterThan(0)
  })
})
