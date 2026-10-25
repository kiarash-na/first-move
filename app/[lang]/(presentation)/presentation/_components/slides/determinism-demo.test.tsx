import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import de from "@/dictionaries/de/presentation.json"
import en from "@/dictionaries/en/presentation.json"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { demoProject } from "@/lib/presentation/quick-check-demo"
import { runDemo } from "@/lib/presentation/run-demo"
import { DeterminismDemo } from "./determinism-demo"

const copy = en.slides.quickCheck
const levelNames = {
  promising: quickCheck.results.levels.promising.label,
  further_analysis: quickCheck.results.levels.further_analysis.label,
  not_promising: quickCheck.results.levels.not_promising.label,
}

function setup() {
  const project = demoProject("en")
  const initial = runDemo(project)
  render(<DeterminismDemo lang="en" project={project} initial={initial} copy={copy} levelNames={levelNames} />)
  return initial
}

describe("DeterminismDemo", () => {
  it("names the example in the slide's language, the same example the engine runs", () => {
    expect(copy.demoName).toBe(demoProject("en").meta.name)
    render(<DeterminismDemo lang="de" project={demoProject("de")} initial={runDemo(demoProject("de"))} copy={de.slides.quickCheck} levelNames={levelNames} />)
    expect(screen.getByText(de.slides.quickCheck.demoName)).toBeInTheDocument()
    expect(screen.queryByText(copy.demoName)).not.toBeInTheDocument()
  })

  it("shows the real result of the illustrative example, labelled as such", () => {
    const initial = setup()
    expect(screen.getByText(copy.demoLabel)).toBeInTheDocument()
    expect(screen.getByText(copy.demoName)).toBeInTheDocument()
    expect(screen.getByText(initial.fingerprint)).toBeInTheDocument()
    expect(screen.getByText(levelNames[initial.level]).closest("p")).toHaveAttribute("data-current", "true")
  })

  it("runs the engine again in the browser and finds the identical result", async () => {
    const initial = setup()
    await userEvent.click(screen.getByRole("button", { name: copy.run }))
    expect(await screen.findByText("Run 2 · identical")).toBeInTheDocument()
    expect(screen.getByText(initial.fingerprint)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: copy.run }))
    expect(await screen.findByText("Run 3 · identical")).toBeInTheDocument()
  })
})
