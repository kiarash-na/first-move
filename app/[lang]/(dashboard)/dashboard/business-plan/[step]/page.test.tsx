// @vitest-environment node
import { describe, expect, it } from "vitest"
import BusinessPlanStepPage, { generateMetadata, generateStaticParams } from "./page"

const props = (step: string, lang = "en") =>
  ({ params: Promise.resolve({ lang, step }) }) as PageProps<"/[lang]/dashboard/business-plan/[step]">

describe("Business Plan step page", () => {
  it("prerenders BM-STEP-01..04", () => {
    expect(generateStaticParams()).toEqual(["opportunity", "business-logic", "reality-check", "implementation"].map((step) => ({ step })))
  })

  it("gates on the module and renders the requested step", async () => {
    const tree = await BusinessPlanStepPage(props("reality-check", "de"))
    expect(tree.props.module).toBe("businessPlan")
    expect(tree.props.children.props).toEqual({ step: "reality-check" })
  })

  it("renders every step", async () => {
    for (const step of ["opportunity", "business-logic", "reality-check", "implementation"]) {
      const tree = await BusinessPlanStepPage(props(step))
      expect(tree.props.children.props.step).toBe(step)
    }
  })

  it("has a title per step and a 404 for unknown steps", async () => {
    expect(await generateMetadata(props("opportunity"))).toEqual({ title: "Opportunity · Business Plan" })
    expect(await generateMetadata(props("area"))).toEqual({})
    await expect(BusinessPlanStepPage(props("area"))).rejects.toThrow()
  })
})
