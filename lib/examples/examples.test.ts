// @vitest-environment node
import { describe, expect, it } from "vitest"
import { LOCALES } from "@/lib/i18n/locales"
import { inputStatus, migrateProject, projectSchema, type Project } from "@/lib/project"
import { run, type ReasonCode, type ResultLevel } from "@/lib/quick-check"
import { EXAMPLES, getExample, localizeExample, ILLUSTRATIVE_LABEL } from "./index"

/** The plan's table (PLAN-DASH-06): what each example must conclude through the real engine. */
const TARGETS: Record<string, { level: ResultLevel; forced: boolean; reasons: ReasonCode[]; scenarioId: string }> = {
  "rural-village-hotel": { level: "not_promising", forced: false, reasons: ["low_coverage_and_densities"], scenarioId: "BM-SCN-01" },
  "school-kindergarten-flats": {
    level: "promising",
    forced: false,
    reasons: ["coverage_sufficient", "economics_favorable", "densities_not_low"],
    scenarioId: "BM-SCN-02",
  },
  // Mixed densities: the building density is low, the heat density is not.
  "housing-cooperatives": { level: "further_analysis", forced: false, reasons: ["building_density_low"], scenarioId: "BM-SCN-03" },
  // Forced by the Unknown thermal source, although nothing else speaks against it.
  "thermal-spa-hotels": { level: "further_analysis", forced: true, reasons: ["unknown_source"], scenarioId: "BM-SCN-04" },
  "new-build-quarter": {
    level: "promising",
    forced: false,
    reasons: ["coverage_sufficient", "economics_favorable", "densities_not_low"],
    scenarioId: "custom",
  },
  "office-retail-block": {
    level: "promising",
    forced: false,
    reasons: ["coverage_sufficient", "economics_favorable", "densities_not_low"],
    scenarioId: "custom",
  },
}

/** Every string in a value, with its path. */
function strings(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]]
  if (Array.isArray(value)) return value.flatMap((entry, index) => strings(entry, `${path}.${index}`))
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, entry]) => strings(entry, path ? `${path}.${key}` : key))
  }
  return []
}

describe("the example list", () => {
  it("has the six examples of the plan, in order, with unique valid ids", () => {
    expect(EXAMPLES.map((example) => example.id)).toEqual(Object.keys(TARGETS))
    for (const example of EXAMPLES) expect(example.id).toMatch(/^[a-z0-9-]{1,64}$/)
    expect(new Set(EXAMPLES.map((example) => example.id)).size).toBe(6)
  })

  it("is based on BM-SCN-01..04 plus two custom examples (OQ-23)", () => {
    expect(EXAMPLES.map((example) => example.scenarioId)).toEqual(["BM-SCN-01", "BM-SCN-02", "BM-SCN-03", "BM-SCN-04", "custom", "custom"])
  })

  it("is found by id", () => {
    expect(getExample("new-build-quarter")?.name.en).toBe("New-build quarter")
    expect(getExample("missing")).toBeUndefined()
  })

  it("carries the label 'Illustrative inputs only' (DESIGN-TOKENS section 6)", () => {
    expect(ILLUSTRATIVE_LABEL.en).toBe("Illustrative inputs only")
  })

  it("shows all three result levels", () => {
    const levels = new Set(
      EXAMPLES.map((example) => {
        const result = run(localizeExample(example, "en"))
        if (result.status !== "complete") throw new Error(`${example.id} is incomplete`)
        return result.assessment.level
      }),
    )
    expect(levels).toEqual(new Set(["promising", "further_analysis", "not_promising"]))
  })
})

describe.each(EXAMPLES.map((example) => [example.id, example] as const))("example %s", (id, example) => {
  const target = TARGETS[id]

  describe.each(LOCALES)("localized to %s", (lang) => {
    const project: Project = localizeExample(example, lang)

    it("is a valid project that survives the import path (JSON round trip and migration)", () => {
      expect(projectSchema.safeParse(project).success).toBe(true)
      const imported = migrateProject(JSON.parse(JSON.stringify(project)))
      expect(imported.ok).toBe(true)
    })

    it("has both modules on, is marked as the example and takes the example's scenario", () => {
      expect(project.meta.modules).toEqual({ quickCheck: true, businessPlan: true })
      expect(project.meta.exampleId).toBe(id)
      expect(project.meta.name).toBe(example.name.en)
      expect(project.businessPlan.scenarioId).toBe(target.scenarioId)
    })

    it("has every Quick Check input and no missing field", () => {
      expect(inputStatus(project, "quickCheck")).toMatchObject({ complete: true, missing: [] })
      expect(project.quickCheck.overrides).toEqual(localizeExample(example, "en").quickCheck.overrides)
    })

    it("fills the Business Plan: no empty text, no empty list (BM-STEP-01..04)", () => {
      expect(inputStatus(project, "businessPlan").missing).toEqual([])
      const empty = strings(project.businessPlan).filter(([, value]) => value.trim() === "")
      expect(empty).toEqual([])
      expect(project.site.name).not.toBe("")
      expect(project.site.stakeholders.length).toBeGreaterThan(0)
      expect(project.businessPlan.allocation.length).toBeGreaterThanOrEqual(2)
      expect(project.businessPlan.criticalAssumptions.length).toBeGreaterThanOrEqual(2)
      expect(project.businessPlan.risks.length).toBeGreaterThanOrEqual(2)
      expect(project.businessPlan.risks.filter((risk) => risk.dealBreaker)).toHaveLength(1)
    })

    it(`reaches ${target.level}${target.forced ? " (forced)" : ""} through the real engine`, () => {
      const result = run(project)
      if (result.status !== "complete") throw new Error(`incomplete: ${result.missing.join(", ")}`)
      expect(result.assessment.level).toBe(target.level)
      expect(result.assessment.forced).toBe(target.forced)
      expect(result.assessment.reasons.map((reason) => reason.code)).toEqual(target.reasons)
    })
  })

  it("has the same Quick Check inputs in both languages", () => {
    const en = localizeExample(example, "en")
    const de = localizeExample(example, "de")
    expect(de.buildings).toEqual(en.buildings)
    expect(de.sources).toEqual(en.sources)
    expect(de.quickCheck).toEqual(en.quickCheck)
  })

  it("is deterministic: the same call gives the same project", () => {
    expect(localizeExample(example, "en")).toEqual(localizeExample(example, "en"))
  })
})

describe("the examples tell the stories of their scenarios", () => {
  const project = (id: string) => localizeExample(getExample(id)!, "en")

  it("states only what BM-SCN-01..04 state in the site section", () => {
    expect(project("rural-village-hotel").site).toMatchObject({
      siteType: "Rural village",
      units: "20-70 units (phased development)",
      currentSupply: [],
      stakeholders: ["Private households", "Hotel"],
      partners: ["Municipality", "Ski resort"],
    })
    expect(project("school-kindergarten-flats").site).toMatchObject({
      units: "Approx. 80 units",
      currentSupply: ["Natural gas"],
      partners: ["Owner of educational facilities"],
    })
    expect(project("housing-cooperatives").site.currentSupply).toEqual(["Natural gas", "Biomass"])
    expect(project("thermal-spa-hotels").site.stakeholders).toEqual(["Thermal spa", "Hotels", "Private households"])
  })

  it("maps building types by QCT-REF-TYPES: school A, kindergarten B, spa C", () => {
    const school = project("school-kindergarten-flats").buildings.shares
    expect(school.category_a["1991_2010"]).toBe(12.5)
    expect(school.category_b["2011_today"]).toBe(12.5)
    expect(project("thermal-spa-hotels").buildings.shares.category_c["2011_today"]).toBe(12.5)
  })

  it("selects the unknown thermal source in the spa example only", () => {
    const unknown = (id: string) => Object.values(project(id).sources.potentials).filter((potential) => potential === "unknown").length
    expect(unknown("thermal-spa-hotels")).toBe(1)
    expect(project("thermal-spa-hotels").sources.potentials.geothermal).toBe("unknown")
    for (const id of Object.keys(TARGETS).filter((other) => other !== "thermal-spa-hotels")) expect(unknown(id)).toBe(0)
  })

  it("keeps the promising examples to 2-15 buildings with several sources (OQ-26)", () => {
    for (const [id, target] of Object.entries(TARGETS)) {
      if (target.level !== "promising") continue
      const current = project(id)
      expect(current.buildings.total).toBeGreaterThanOrEqual(2)
      expect(current.buildings.total).toBeLessThanOrEqual(15)
      const selected = Object.values(current.sources.potentials).filter((potential) => potential !== null)
      expect(selected.length).toBeGreaterThanOrEqual(2)
    }
  })

  it("marks invented details as illustrative", () => {
    for (const example of EXAMPLES) {
      const all = strings(localizeExample(example, "en")).map(([, value]) => value.toLowerCase())
      expect(all.some((value) => value.includes("illustrative"))).toBe(true)
    }
  })
})
