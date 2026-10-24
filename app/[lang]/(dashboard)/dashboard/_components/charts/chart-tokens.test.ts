import { describe, expect, it } from "vitest"
import { ramp, SERIES } from "./chart-tokens"

describe("chart tokens", () => {
  it("uses only the --chart-* tokens", () => {
    for (const value of Object.values(SERIES)) expect(value).toMatch(/^var\(--chart-[1-5]\)$/)
  })

  it("builds a light-to-dark ramp of one hue", () => {
    const steps = ramp("hot", 5)
    expect(steps).toHaveLength(5)
    expect(steps.every((step) => step.includes("--accent-hot"))).toBe(true)
    const shares = steps.map((step) => Number(/ (\d+)%,/.exec(step)![1]))
    expect(shares).toEqual([...shares].sort((a, b) => a - b))
    expect(new Set(shares).size).toBe(5)
    expect(ramp("cool", 1)).toEqual(["var(--accent-cool)"])
  })
})
