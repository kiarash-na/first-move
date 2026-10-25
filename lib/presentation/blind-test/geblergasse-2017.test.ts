import { describe, expect, it } from "vitest"
import { blindProject, BLIND_SOURCE, GEBLERGASSE_2017, KNOWN_OUTCOME } from "./geblergasse-2017"

/** Words that would tell the engine the outcome or the project's identity. */
const FORBIDDEN = [
  /award|güteziegel|pioneer/i,
  /in operation|running since|was built|built in|has run|amortis/i,
  /\b20(18|19|2\d)\b/,
  /geblergasse|smart block|hernalser|ottakringer|veronikagasse/i,
  /futurezone|anergieurban|18 (probes|boreholes)|350,000/i,
]

const texts = (value: unknown): string[] => {
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.flatMap(texts)
  if (value && typeof value === "object") return Object.values(value).flatMap(texts)
  return []
}

describe("blind input (presentation slide 5)", () => {
  it("applies to a Business-Plan-only project without errors", () => {
    const project = blindProject()
    expect(project.meta.modules).toEqual({ quickCheck: false, businessPlan: true })
    expect(project.businessPlan.risks.filter((risk) => risk.dealBreaker)).toHaveLength(1)
    expect(project.site.location).toMatch(/^Vienna/)
  })

  it("reveals neither the outcome nor the project's name", () => {
    for (const text of texts(GEBLERGASSE_2017)) for (const pattern of FORBIDDEN) expect(text).not.toMatch(pattern)
  })

  it("names one source written before construction, and the outcome sources apart", () => {
    expect(BLIND_SOURCE.created < "2018-01-01").toBe(true)
    expect(Object.values(KNOWN_OUTCOME.sources).every((url) => url.startsWith("https://"))).toBe(true)
  })
})
