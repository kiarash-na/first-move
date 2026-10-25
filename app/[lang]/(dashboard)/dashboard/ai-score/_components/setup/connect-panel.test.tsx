import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { fakeClient } from "../test-utils/fake-client"
import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { ConnectPanel } from "./connect-panel"
import { DEFAULT_CHOICE } from "./model-picker"

describe("ConnectPanel", () => {
  it("brings the key, both models, what is sent and the cost together", () => {
    const copy = aiScoreCopy().setup
    const project = example()
    renderAiScore(<ConnectPanel project={project} createClient={fakeClient().create} model={DEFAULT_CHOICE} onModel={vi.fn()} />, {
      store: aiScoreStore(project).store,
    })
    const panel = screen.getByRole("region", { name: copy.title })
    expect(panel).toContainElement(screen.getByLabelText(copy.key.label))
    expect(panel).toHaveTextContent(copy.decision.name)
    expect(screen.getByRole("group", { name: copy.text.label })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: copy.data.ack })).toBeInTheDocument()
    expect(panel).toHaveTextContent(aiScoreCopy().usage.title)
  })
})
