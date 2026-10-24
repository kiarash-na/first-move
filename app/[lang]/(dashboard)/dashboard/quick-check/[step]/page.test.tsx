// @vitest-environment node
import { Suspense, type ReactElement } from "react"
import { describe, expect, it } from "vitest"
import { QuickCheckStep } from "./_components/quick-check-step"
import { QuickCheckStepSkeleton } from "./_components/quick-check-step-skeleton"
import QuickCheckStepPage, { ensureStatic, generateMetadata, generateStaticParams } from "./page"

const props = (step: string, lang = "en") =>
  ({ params: Promise.resolve({ lang, step }) }) as PageProps<"/[lang]/dashboard/quick-check/[step]">

type Element = ReactElement<{ children: ReactElement<Record<string, unknown>>; fallback?: ReactElement }>

describe("Quick Check step page", () => {
  it("prerenders the four steps and the results, and waits for the complete page", () => {
    expect(generateStaticParams()).toEqual(["area", "buildings", "sources", "options", "results"].map((step) => ({ step })))
    expect(ensureStatic).toBe("navigation")
  })

  it("reads the step only inside Suspense, with a skeleton fallback", () => {
    const page = props("sources")
    const boundary = (QuickCheckStepPage(page) as Element).props.children as Element
    expect(boundary.type).toBe(Suspense)
    expect(boundary.props.fallback?.type).toBe(QuickCheckStepSkeleton)
    expect(boundary.props.children.type).toBe(QuickCheckStep)
    expect(boundary.props.children.props.params).toBe(page.params)
  })

  it("has a title per step and none for unknown steps", async () => {
    expect(await generateMetadata(props("area"))).toEqual({ title: "Project area · Quick Check" })
    expect(await generateMetadata(props("nope"))).toEqual({})
  })
})
