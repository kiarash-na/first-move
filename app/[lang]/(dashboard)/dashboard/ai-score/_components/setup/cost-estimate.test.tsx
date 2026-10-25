import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { TEXT_MODELS } from "@/lib/assistant/gateway/models"
import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { CostEstimate } from "./cost-estimate"
import { estimateCost, roughAmount } from "./cost"

const copy = aiScoreCopy().usage

describe("CostEstimate (D-33)", () => {
  it("shows the order of magnitude and explains it on demand", async () => {
    const project = example()
    const model = TEXT_MODELS[0]
    const estimate = estimateCost(project, model)
    renderAiScore(<CostEstimate project={project} model={model} modelId={model.id} />, { store: aiScoreStore(project).store })
    const rough = roughAmount(estimate.totalUsd!)
    expect(screen.getByText(`${rough.below ? "Less than" : "About"} $${rough.value}`)).toBeInTheDocument()
    expect(screen.getByText(copy.note)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: copy.how.title }))
    expect(screen.getByText(/at Jev's input price of \$0\.042 per million tokens/)).toBeInTheDocument()
    expect(screen.getByText((_, element) => element?.tagName === "P" && (element.textContent ?? "").includes(`at the prices of ${model.name}`))).toBeInTheDocument()
  })

  it("prices only the decisions for a custom model", async () => {
    const project = example()
    renderAiScore(<CostEstimate project={project} model={null} modelId="example/custom-model" />, { store: aiScoreStore(project).store })
    expect(screen.getByText(/The price of this text model is not known here/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: copy.how.title }))
    expect(screen.getByText(/The prices of this model are not known here/)).toBeInTheDocument()
  })
})
