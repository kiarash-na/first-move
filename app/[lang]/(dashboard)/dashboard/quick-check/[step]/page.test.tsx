// @vitest-environment node
import { describe, expect, it } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { STEP_EXPLAIN } from "@/lib/quick-check"
import QuickCheckStepPage, { generateMetadata, generateStaticParams } from "./page"

const props = (step: string, lang = "en") =>
  ({ params: Promise.resolve({ lang, step }) }) as PageProps<"/[lang]/dashboard/quick-check/[step]">

describe("Quick Check step page", () => {
  it("prerenders the four steps and the results", () => {
    expect(generateStaticParams()).toEqual(["area", "buildings", "sources", "options", "results"].map((step) => ({ step })))
  })

  it("explains each input step (D-33) and gates on the module", async () => {
    const tree = await QuickCheckStepPage(props("sources"))
    expect(tree.props.module).toBe("quickCheck")
    expect(tree.props.children.props).toMatchObject({ title: shell.nav.items.quickCheck.sources, tone: "cool", eyebrow: "Quick Check · 03" })
    expect(tree.props.children.props.explain).toBe(STEP_EXPLAIN.sources)
    const results = await QuickCheckStepPage(props("results"))
    expect(results.props.children.props.explain).toBeUndefined()
  })

  it("has a title per step and a 404 for unknown steps", async () => {
    expect(await generateMetadata(props("area"))).toEqual({ title: "Project area · Quick Check" })
    expect(await generateMetadata(props("nope"))).toEqual({})
    await expect(QuickCheckStepPage(props("nope"))).rejects.toThrow()
  })
})
