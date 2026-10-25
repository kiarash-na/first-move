import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { TEXT_MODELS } from "@/lib/assistant/gateway/models"
import { createProject } from "@/lib/project"
import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example, NOW } from "../test-utils/scored"
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
    const rough = roughAmount(estimateCost(project, null).decisionUsd)
    renderAiScore(<CostEstimate project={project} model={null} modelId="example/custom-model" />, { store: aiScoreStore(project).store })
    expect(screen.getByText(`${rough.below ? "Less than" : "About"} $${rough.value} for the decisions. The price of this text model is not known here.`)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: copy.how.title }))
    expect(screen.getByText(/The prices of this model are not known here/)).toBeInTheDocument()
  })

  it("says \"less than\" when the decisions of a small plan cost below the floor", () => {
    const empty = createProject({ modules: { businessPlan: true }, id: "11111111-1111-4111-8111-111111111111", now: NOW() })
    expect(roughAmount(estimateCost(empty, null).decisionUsd).below).toBe(true)
    renderAiScore(<CostEstimate project={empty} model={null} modelId="example/custom-model" />, { store: aiScoreStore(empty).store })
    expect(screen.getByText("Less than $0.001 for the decisions. The price of this text model is not known here.")).toBeInTheDocument()
  })

  it("reads naturally in German", () => {
    const empty = createProject({ modules: { businessPlan: true }, id: "11111111-1111-4111-8111-111111111111", now: NOW() })
    renderAiScore(<CostEstimate project={empty} model={null} modelId="example/custom-model" />, { store: aiScoreStore(empty).store, lang: "de" })
    expect(screen.getByText("Weniger als 0,001 $ für die Entscheidungen. Der Preis dieses Textmodells ist hier nicht bekannt.")).toBeInTheDocument()
  })
})
