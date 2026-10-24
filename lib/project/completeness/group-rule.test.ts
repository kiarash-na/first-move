// @vitest-environment node
import { describe, expect, it } from "vitest"
import { applyPatch } from "@/lib/project/apply-patch"
import { createProject } from "@/lib/project/create-project"
import { getGroup } from "@/lib/project/fields/registry"
import { groupRuleStatus } from "./group-rule"

const shares = getGroup("buildings.shares")!
const sources = getGroup("sources.potentials")!
const base = () => createProject({ modules: { quickCheck: true } })

describe("groupRuleStatus", () => {
  it("sums the share grid, empty cells as 0, within float tolerance only (R-03)", () => {
    expect(groupRuleStatus(base(), shares)).toEqual({ ok: false, value: 0 })
    const thirds = applyPatch(base(), {
      "buildings.shares.residential.1991_2010": 33.33,
      "buildings.shares.residential.2011_today": 33.33,
      "buildings.shares.category_b.2011_today": 33.34,
    }).project
    expect(groupRuleStatus(thirds, shares).ok).toBe(true)
    const almost = applyPatch(thirds, { "buildings.shares.category_b.2011_today": 33.3 }).project
    expect(groupRuleStatus(almost, shares)).toMatchObject({ ok: false })
    expect(groupRuleStatus(almost, shares).value).toBeCloseTo(99.96)
  })

  it("counts industry in the sum (QCT-IN-04)", () => {
    const project = applyPatch(base(), {
      "buildings.shares.residential.1961_1990": 80,
      "buildings.shares.industry.1961_1990": 20,
    }).project
    expect(groupRuleStatus(project, shares)).toEqual({ ok: true, value: 100 })
  })

  it("needs at least one selected source, Unknown included (QCT-IN-06)", () => {
    expect(groupRuleStatus(base(), sources)).toEqual({ ok: false, value: 0 })
    const project = applyPatch(base(), { "sources.potentials.ambient_air": "unknown" }).project
    expect(groupRuleStatus(project, sources)).toEqual({ ok: true, value: 1 })
  })

  it("passes groups without a rule", () => {
    expect(groupRuleStatus(base(), getGroup("quickCheck.manualDemand")!)).toEqual({ ok: true, value: 0 })
  })
})
