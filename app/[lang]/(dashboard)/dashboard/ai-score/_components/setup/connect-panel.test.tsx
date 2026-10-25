import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { PROVIDERS } from "@/lib/assistant/providers/types"
import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { ConnectPanel } from "./connect-panel"
import { defaultChoice } from "./model-picker"

describe("ConnectPanel", () => {
  it("brings the provider choice, the key, both models, what is sent and the cost together", () => {
    const copy = aiScoreCopy().setup
    const project = example()
    renderAiScore(<ConnectPanel project={project} provider="gateway" onProvider={vi.fn()} model={defaultChoice("gateway")} onModel={vi.fn()} />, {
      store: aiScoreStore(project).store,
    })
    const panel = screen.getByRole("region", { name: copy.title })
    expect(panel).toContainElement(screen.getByLabelText(copy.key.label.gateway))
    expect(panel).toHaveTextContent(copy.decision.gateway.name)
    expect(screen.getByRole("group", { name: copy.text.label })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: copy.data.ack })).toBeInTheDocument()
    expect(panel).toHaveTextContent(aiScoreCopy().usage.title)
  })

  it("offers both providers, OpenRouter first, and reports the pick", async () => {
    const copy = aiScoreCopy().setup
    const onProvider = vi.fn()
    renderAiScore(<ConnectPanel project={example()} provider="openrouter" onProvider={onProvider} model={defaultChoice("openrouter")} onModel={vi.fn()} />, {
      store: aiScoreStore(example()).store,
    })
    const radios = screen.getAllByRole("radio", { name: /OpenRouter|Vercel AI Gateway/ })
    expect(radios.map((radio) => (radio as HTMLInputElement).value)).toEqual([...PROVIDERS])
    expect(screen.getByRole("radio", { name: new RegExp(copy.providers.openrouter) })).toBeChecked()
    expect(screen.getByLabelText(copy.key.label.openrouter)).toBeInTheDocument()
    await screen.getByRole("radio", { name: new RegExp(copy.providers.gateway) }).click()
    expect(onProvider).toHaveBeenCalledWith("gateway")
  })
})
