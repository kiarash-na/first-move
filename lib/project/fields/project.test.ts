// @vitest-environment node
import { describe, expect, it } from "vitest"
import { PROJECT_FIELDS, PROJECT_GROUPS } from "./project"

describe("project fields", () => {
  it("expose the name and the two module switches, nothing system-managed", () => {
    expect(PROJECT_FIELDS.map((field) => field.id)).toEqual(["meta.name", "meta.modules.quickCheck", "meta.modules.businessPlan"])
    expect(PROJECT_FIELDS.every((field) => field.module === "project" && field.step === "project")).toBe(true)
  })

  it("take their copy from the shell dictionary", () => {
    expect(PROJECT_FIELDS.every((field) => field.text.area === "shell")).toBe(true)
    expect(PROJECT_GROUPS[0]).toMatchObject({ id: "meta.modules", layout: "section" })
  })
})
