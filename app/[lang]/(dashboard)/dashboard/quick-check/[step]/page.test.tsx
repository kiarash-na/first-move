// @vitest-environment node
import type { ReactElement } from "react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import shell from "@/dictionaries/en/shell.json"
import { ProjectGate } from "../../_components/project-gate"
import { ResultsView } from "./_results/results-view"
import { StepView } from "./_steps/step-view"
import QuickCheckStepPage, { generateMetadata, generateStaticParams } from "./page"

const props = (step: string, lang = "en") =>
  ({ params: Promise.resolve({ lang, step }) }) as PageProps<"/[lang]/dashboard/quick-check/[step]">

type Tree = ReactElement<{ children: ReactElement<Record<string, unknown>>[] }>

describe("Quick Check step page", () => {
  it("prerenders the four steps and the results", () => {
    expect(generateStaticParams()).toEqual(["area", "buildings", "sources", "options", "results"].map((step) => ({ step })))
  })

  it("renders a static header and the step inside the module gate", async () => {
    const tree = (await QuickCheckStepPage(props("sources"))) as Tree
    const [header, gate] = tree.props.children
    expect(header.props).toMatchObject({ title: shell.nav.items.quickCheck.sources, eyebrow: "Quick Check · 03", tone: "cool" })
    expect(header.props.description).toBe(quickCheck.ui.intro.sources)
    expect(gate.type).toBe(ProjectGate)
    expect(gate.props.module).toBe("quickCheck")
    const step = gate.props.children as ReactElement<{ step: string }>
    expect(step.type).toBe(StepView)
    expect(step.props.step).toBe("sources")
  })

  it("renders the results view on the results page", async () => {
    const tree = (await QuickCheckStepPage(props("results"))) as Tree
    const [header, gate] = tree.props.children
    expect(header.props).toMatchObject({ title: quickCheck.ui.results.title, eyebrow: "Quick Check" })
    expect((gate.props.children as ReactElement).type).toBe(ResultsView)
  })

  it("has a title per step and a 404 for unknown steps", async () => {
    expect(await generateMetadata(props("area"))).toEqual({ title: "Project area · Quick Check" })
    expect(await generateMetadata(props("nope"))).toEqual({})
    await expect(QuickCheckStepPage(props("nope"))).rejects.toThrow()
  })
})
