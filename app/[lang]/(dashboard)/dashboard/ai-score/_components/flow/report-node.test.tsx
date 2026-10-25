import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import type { AiReport } from "@/lib/project"
import { aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { ReportNode } from "./report-node"

const REPORT: AiReport = { model: "anthropic/claude-haiku-5.5", lang: "en", headline: "Specific, open financing.", summary: "S.", strengths: [], gaps: [], actions: [] }
const show = (state: Parameters<typeof ReportNode>[0]["state"], report: AiReport | null = null) =>
  renderAiScore(<ReportNode state={state} report={report} />, { store: aiScoreStore(example()).store })

describe("ReportNode", () => {
  it("names the model that wrote the report and shows its headline", async () => {
    show("done", REPORT)
    const node = screen.getByRole("button", { name: /Written by anthropic\/claude-haiku-5\.5/ })
    await userEvent.click(node)
    expect(screen.getByRole("dialog", { name: "Report" })).toHaveTextContent("Specific, open financing.")
  })

  it("tells writing, failed and not yet written apart", () => {
    const first = show("running")
    expect(screen.getByRole("button")).toHaveTextContent("Writing…")
    first.unmount()
    const second = show("failed")
    expect(screen.getByRole("button")).toHaveTextContent("Could not be written")
    second.unmount()
    show("none")
    expect(screen.getByRole("button")).toHaveTextContent("Not written yet")
  })
})
