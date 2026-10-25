import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { createProject } from "@/lib/project"
import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example, NOW } from "../test-utils/scored"
import { applyEvent, startProgress } from "./progress"
import { filledCount, RunPanel, type RunReadiness } from "./run-panel"
import type { AnalysisRun } from "./use-analysis"

const copy = aiScoreCopy().run
const IDLE: AnalysisRun = { phase: "idle", progress: null, error: null, reportError: null, saved: null }
const READY: RunReadiness = { key: true, ack: true, model: true }

function show({
  project = example(),
  run = IDLE,
  readiness = READY,
  hasScore = false,
  textBusy = false,
}: { project?: ReturnType<typeof example>; run?: AnalysisRun; readiness?: RunReadiness; hasScore?: boolean; textBusy?: boolean } = {}) {
  const handlers = { onStart: vi.fn(), onCancel: vi.fn(), onWriteAgain: vi.fn() }
  renderAiScore(<RunPanel project={project} run={run} readiness={readiness} hasScore={hasScore} hasReport={false} writing={false} textBusy={textBusy} textError={null} {...handlers} />, {
    store: aiScoreStore(project).store,
  })
  return handlers
}

describe("RunPanel", () => {
  it("starts a run when everything is ready", async () => {
    const handlers = show()
    expect(screen.getByText("27 of 27 plan parts have text.")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: copy.start }))
    expect(handlers.onStart).toHaveBeenCalled()
    expect(screen.queryByRole("button", { name: copy.cancel })).not.toBeInTheDocument()
  })

  it("is disabled without a key, a confirmation or a valid model, and says why", () => {
    show({ readiness: { key: false, ack: false, model: false } })
    expect(screen.getByRole("button", { name: copy.start })).toBeDisabled()
    expect(screen.getByText(copy.needs.key)).toBeInTheDocument()
    expect(screen.getByText(copy.needs.ack)).toBeInTheDocument()
    expect(screen.getByText(copy.needs.model)).toBeInTheDocument()
  })

  it("links to the first Business Plan step when nothing is filled", () => {
    const empty = createProject({ modules: { businessPlan: true }, id: "11111111-1111-4111-8111-111111111111", now: NOW() })
    expect(filledCount(empty)).toBe(0)
    show({ project: empty })
    expect(screen.getByRole("button", { name: copy.start })).toBeDisabled()
    expect(screen.getByText(copy.needs.filled)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: copy.openPlan })).toHaveAttribute("href", "/en/dashboard/business-plan/opportunity")
  })

  it("follows a run in flight and cancels it", async () => {
    const progress = applyEvent(startProgress(), { type: "turn-start", turn: 0, questions: 0 })
    const handlers = show({ run: { ...IDLE, phase: "running", progress } })
    expect(screen.getByRole("button", { name: copy.start })).toBeDisabled()
    expect(screen.getByRole("list", { name: copy.progress.label })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: copy.cancel }))
    expect(handlers.onCancel).toHaveBeenCalled()
  })

  it("offers to score again, replacing the saved score", () => {
    show({ hasScore: true })
    expect(screen.getByRole("button", { name: copy.again })).toBeEnabled()
    expect(screen.getByText(copy.againNote)).toBeInTheDocument()
  })

  it("waits while a report or suggestions are being written", () => {
    show({ hasScore: true, textBusy: true })
    expect(screen.getByRole("button", { name: copy.again })).toBeDisabled()
  })

  it("writes a failed report again", async () => {
    const handlers = show({ run: { ...IDLE, phase: "done", saved: true, reportError: "provider" }, hasScore: true })
    await userEvent.click(screen.getByRole("button", { name: copy.writeAgain }))
    expect(handlers.onWriteAgain).toHaveBeenCalled()
  })
})
