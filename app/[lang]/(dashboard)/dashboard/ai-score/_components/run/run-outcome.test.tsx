import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { RunOutcome } from "./run-outcome"
import type { AnalysisRun } from "./use-analysis"

const copy = aiScoreCopy()
const base: AnalysisRun = { phase: "done", progress: null, error: null, reportError: null, saved: true }

function show(run: Partial<AnalysisRun>, { hasReport = false, textError = null }: { hasReport?: boolean; textError?: AnalysisRun["error"] } = {}) {
  return renderAiScore(<RunOutcome run={{ ...base, ...run }} hasReport={hasReport} textError={textError} writeAgain={<button type="button">again</button>} />, {
    store: aiScoreStore(example()).store,
  })
}

describe("RunOutcome", () => {
  it("says the score is saved", () => {
    show({})
    expect(screen.getByRole("status")).toHaveTextContent(copy.run.done)
  })

  it("keeps the score and offers to write a failed report again", () => {
    show({ reportError: "credits" })
    expect(screen.getByRole("alert")).toHaveTextContent(`The score is saved, but the report could not be written. ${copy.errors.credits}`)
    expect(screen.getByRole("button", { name: "again" })).toBeInTheDocument()
  })

  it("shows the error of a later attempt, and nothing once the report exists", () => {
    const { unmount } = show({ reportError: "credits" }, { textError: "model" })
    expect(screen.getByRole("alert")).toHaveTextContent(copy.errors.model)
    unmount()
    show({ reportError: "credits" }, { hasReport: true })
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent(copy.run.done)
  })

  it("explains a stopped run and one that could not be saved", () => {
    const { unmount } = show({ phase: "failed", error: "rate" })
    expect(screen.getByRole("alert")).toHaveTextContent(`${copy.run.failed.replace(" {reason}", "")} ${copy.errors.rate}`)
    unmount()
    show({ saved: false })
    expect(screen.getByRole("alert")).toHaveTextContent(copy.run.notSaved)
  })

  it("shows nothing while idle or running", () => {
    show({ phase: "running" })
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })
})
