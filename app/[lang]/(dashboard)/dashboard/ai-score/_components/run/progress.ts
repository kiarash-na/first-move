import type { FlowNode } from "@/lib/ai/plan-score/nodes"
import type { RunEvent, RunTurn } from "@/lib/ai/plan-score/run"

/**
 * The progress of one run, step by step (PLAN-AI-SCORE-00 step 6): turn 0 without AI, the four
 * Jev turns, then the report. Built from the engine's `RunEvent`s; pure.
 */
export type StepState = "pending" | "running" | "done" | "failed" | "skipped"

export const RUN_TURNS: readonly RunTurn[] = [0, 1, 2, 3, 4]

export interface TurnProgress {
  turn: RunTurn
  state: StepState
  /** Questions Jev was asked in the turn, once it started. */
  questions: number | null
  inputTokens: number | null
}

export interface RunProgress {
  turns: TurnProgress[]
  report: StepState
  /** Every node decided so far, in the order the turns emitted them. */
  nodes: FlowNode[]
}

export function startProgress(): RunProgress {
  return { turns: RUN_TURNS.map((turn) => ({ turn, state: "pending", questions: null, inputTokens: null })), report: "pending", nodes: [] }
}

const LAST_TURN = RUN_TURNS[RUN_TURNS.length - 1]

export function applyEvent(progress: RunProgress, event: RunEvent): RunProgress {
  const turns = progress.turns.map((entry) => {
    if (entry.turn !== event.turn) return entry
    return event.type === "turn-start" ? { ...entry, state: "running" as const, questions: event.questions } : { ...entry, state: "done" as const, inputTokens: event.inputTokens }
  })
  if (event.type === "turn-start") return { ...progress, turns }
  return { turns, report: event.turn === LAST_TURN ? "running" : progress.report, nodes: [...progress.nodes, ...event.nodes] }
}

/** The run ended: the report was written, or failed (the score is kept either way). */
export function finishProgress(progress: RunProgress, reportFailed: boolean): RunProgress {
  return { ...progress, report: reportFailed ? "failed" : "done" }
}

/** The run stopped (an error or a cancel): the running step failed, the rest did not run. */
export function stopProgress(progress: RunProgress): RunProgress {
  const stop = (state: StepState): StepState => (state === "running" ? "failed" : state === "pending" ? "skipped" : state)
  return { ...progress, turns: progress.turns.map((entry) => ({ ...entry, state: stop(entry.state) })), report: stop(progress.report) }
}

/** The step that is running: a turn, "report", or null. */
export function currentStep(progress: RunProgress | null): RunTurn | "report" | null {
  if (!progress) return null
  const turn = progress.turns.find((entry) => entry.state === "running")
  if (turn) return turn.turn
  return progress.report === "running" ? "report" : null
}
