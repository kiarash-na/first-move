// @vitest-environment node
import { Suspense, type ReactElement } from "react"
import { describe, expect, it } from "vitest"
import { GateSkeleton } from "../../_components/gate-skeleton"
import { BusinessPlanStepRoute } from "./_components/business-plan-step-route"
import BusinessPlanStepPage, { ensureStatic, generateMetadata, generateStaticParams } from "./page"

const props = (step: string, lang = "en") =>
  ({ params: Promise.resolve({ lang, step }) }) as PageProps<"/[lang]/dashboard/business-plan/[step]">

type Element = ReactElement<{ children: ReactElement<Record<string, unknown>>; fallback?: ReactElement }>

describe("Business Plan step page", () => {
  it("prerenders BM-STEP-01..04 and waits for the complete page", () => {
    expect(generateStaticParams()).toEqual(["opportunity", "business-logic", "reality-check", "implementation"].map((step) => ({ step })))
    expect(ensureStatic).toBe("navigation")
  })

  it("reads the step only inside Suspense, with the gate's skeleton as fallback", () => {
    const page = props("reality-check", "de")
    const boundary = BusinessPlanStepPage(page) as Element
    expect(boundary.type).toBe(Suspense)
    expect(boundary.props.fallback?.type).toBe(GateSkeleton)
    expect(boundary.props.children.type).toBe(BusinessPlanStepRoute)
    expect(boundary.props.children.props.params).toBe(page.params)
  })

  it("has a title per step and none for unknown steps", async () => {
    expect(await generateMetadata(props("opportunity"))).toEqual({ title: "Opportunity · Business Plan" })
    expect(await generateMetadata(props("area"))).toEqual({})
  })
})
