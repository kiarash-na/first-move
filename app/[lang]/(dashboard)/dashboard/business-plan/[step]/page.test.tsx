// @vitest-environment node
import { describe, expect, it } from "vitest"
import BusinessPlanStepPage, { generateMetadata, generateStaticParams } from "./page"

const props = (step: string, lang = "en") =>
  ({ params: Promise.resolve({ lang, step }) }) as PageProps<"/[lang]/dashboard/business-plan/[step]">

describe("Business Plan step page", () => {
  it("prerenders BM-STEP-01..04", () => {
    expect(generateStaticParams()).toEqual(["opportunity", "business-logic", "reality-check", "implementation"].map((step) => ({ step })))
  })

  it("gates on the module and uses the orange role", async () => {
    const tree = await BusinessPlanStepPage(props("reality-check", "de"))
    expect(tree.props.module).toBe("businessPlan")
    expect(tree.props.children.props).toMatchObject({ title: "Reality check", tone: "hot", eyebrow: "Business Plan · 03" })
  })

  it("has a title per step and a 404 for unknown steps", async () => {
    expect(await generateMetadata(props("opportunity"))).toEqual({ title: "Opportunity · Business Plan" })
    expect(await generateMetadata(props("area"))).toEqual({})
    await expect(BusinessPlanStepPage(props("area"))).rejects.toThrow()
  })
})
