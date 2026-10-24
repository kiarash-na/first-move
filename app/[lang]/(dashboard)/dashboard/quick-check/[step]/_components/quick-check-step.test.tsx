// @vitest-environment node
import type { ReactElement } from "react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import shell from "@/dictionaries/en/shell.json"
import { ProjectGate } from "../../../_components/project-gate"
import { ResultsView } from "../_results/results-view"
import { StepView } from "../_steps/step-view"
import { QuickCheckStep } from "./quick-check-step"

const params = (step: string, lang = "en") => Promise.resolve({ lang, step })

type Tree = ReactElement<{ children: ReactElement<Record<string, unknown>>[] }>

describe("QuickCheckStep", () => {
  it("renders a static header and the step inside the module gate", async () => {
    const tree = (await QuickCheckStep({ params: params("sources") })) as Tree
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
    const tree = (await QuickCheckStep({ params: params("results") })) as Tree
    const [header, gate] = tree.props.children
    expect(header.props).toMatchObject({ title: quickCheck.ui.results.title, eyebrow: "Quick Check" })
    expect((gate.props.children as ReactElement).type).toBe(ResultsView)
  })

  it("is a 404 for an unknown step or language", async () => {
    await expect(QuickCheckStep({ params: params("nope") })).rejects.toThrow()
    await expect(QuickCheckStep({ params: params("area", "xx") })).rejects.toThrow()
  })
})
