// @vitest-environment node
import { describe, expect, it } from "vitest"
import { applyPatch } from "./apply-patch"
import { clearPatch } from "./clear-patch"
import { createProject } from "./create-project"
import { fieldsOf, getField } from "./fields/registry"

describe("clearPatch", () => {
  it("resets fields to their not-entered value", () => {
    expect(
      clearPatch([getField("buildings.total")!, getField("sources.pv")!, getField("site.stakeholders")!, getField("site.name")!]),
    ).toEqual({ "buildings.total": null, "sources.pv": false, "site.stakeholders": [], "site.name": "" })
  })

  it("resets all parameter overrides in one patch (D-10)", () => {
    const base = createProject({ modules: { quickCheck: true } })
    const custom = applyPatch(base, {
      "quickCheck.overrides.economic.interest_rate": 5,
      "quickCheck.overrides.heating.geothermal.high": 200_000,
    }).project
    const reset = applyPatch(custom, clearPatch(fieldsOf({ step: "assumptions" })))
    expect(reset.ok).toBe(true)
    expect(reset.project.quickCheck.overrides).toEqual(base.quickCheck.overrides)
  })
})
