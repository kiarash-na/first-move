import { describe, expect, it } from "vitest"
import { getExample, localizeExample } from "@/lib/examples"
import { applyPatch } from "@/lib/project/apply-patch"
import { createProject } from "@/lib/project/create-project"
import { run } from "@/lib/quick-check"
import { qcPrefill, sharedSiteData } from "./qc-prefill"

const example = () => localizeExample(getExample("housing-cooperatives")!, "en")

describe("Quick Check prefill (ALG-09, D-27)", () => {
  it("reads demand, revenue and investment from the engine, never from its own maths", () => {
    const project = example()
    const prefill = qcPrefill(project)
    const result = run(project)
    expect(prefill.status).toBe("ready")
    if (prefill.status !== "ready" || result.status !== "complete") throw new Error("expected a complete run")
    expect(prefill.numbers).toEqual({
      heatingDemandKwh: result.values.heatingDemandKwh,
      coolingDemandKwh: result.values.coolingDemandKwh,
      overallRevenue: result.values.overallRevenue,
      overallInvestment: result.values.overallInvestment,
      flags: result.flags,
    })
    expect(prefill.numbers.overallInvestment).toBeGreaterThan(0)
    expect(prefill.result).toEqual(result)
  })

  it("shares the site, buildings and selected sources with the Quick Check", () => {
    const shared = sharedSiteData(example())
    expect(shared.totalBuildings).toBe(8)
    expect(shared.areaM2).toBe(100_000)
    expect(shared.sources.length).toBeGreaterThan(0)
    expect(shared.sources.every((entry) => entry.potential !== undefined)).toBe(true)
  })

  it("is off when the Quick Check module is off, with no numbers", () => {
    const project = applyPatch(example(), { "meta.modules.quickCheck": false }).project
    const prefill = qcPrefill(project)
    expect(prefill.status).toBe("off")
    expect(prefill).not.toHaveProperty("numbers")
    // the shared inputs are still there for the site section
    expect(prefill.shared.totalBuildings).toBe(8)
  })

  it("is incomplete with a pointer to the first Quick Check step to finish", () => {
    const project = createProject({ modules: { quickCheck: true, businessPlan: true } })
    const prefill = qcPrefill(project)
    expect(prefill.status).toBe("incomplete")
    if (prefill.status !== "incomplete") throw new Error("expected incomplete")
    expect(prefill.nextStep).toBe("area")
    expect(prefill.shared).toEqual({ totalBuildings: null, areaM2: null, sources: [] })
  })

  it("reflects a custom-parameters flag so the card can say so (D-10)", () => {
    const project = applyPatch(example(), { "quickCheck.overrides.economic.heating_base_price": 99 }).project
    const prefill = qcPrefill(project)
    expect(prefill.status === "ready" && prefill.numbers.flags.customParameters).toBe(true)
  })
})
