import type { AiReport, AiScore } from "@/lib/project"
import { RUN_TURNS, type RunProgress, type StepState } from "../run/progress"
import { aggregateOfNodes, aggregateOfScore, type AggregateView } from "./aggregate-view"
import type { FlowStates } from "./flow-graph"
import { graphFromNodes, graphFromScore, type FlowGraph } from "./flow-model"

/**
 * Where the decision flow comes from: nothing yet, a run in flight (its progress, live) or the
 * saved score (rebuilt from the engine's definitions). Pure.
 */
export type FlowSource =
  | { mode: "idle" }
  | { mode: "live"; progress: RunProgress }
  | { mode: "saved"; score: AiScore; changed: readonly string[]; writing: boolean }

export interface FlowView {
  graph: FlowGraph
  states: FlowStates
  aggregate: AggregateView | null
  report: AiReport | null
}

const turnsIn = (state: (turn: (typeof RUN_TURNS)[number]) => { state: StepState; questions: number | null }) =>
  Object.fromEntries(RUN_TURNS.map((turn) => [turn, state(turn)])) as FlowStates["turns"]

export function flowView(source: FlowSource): FlowView {
  switch (source.mode) {
    case "idle":
      return {
        graph: graphFromNodes([]),
        states: { turns: turnsIn(() => ({ state: "pending", questions: null })), aggregate: "pending", report: "pending" },
        aggregate: null,
        report: null,
      }
    case "live": {
      const { progress } = source
      const done = progress.turns.every((entry) => entry.state === "done")
      const stopped = progress.turns.some((entry) => entry.state === "failed")
      return {
        graph: graphFromNodes(progress.nodes),
        states: {
          turns: turnsIn((turn) => {
            const entry = progress.turns.find((candidate) => candidate.turn === turn)!
            return { state: entry.state, questions: entry.questions }
          }),
          aggregate: done ? "done" : stopped ? "skipped" : "pending",
          report: progress.report,
        },
        aggregate: done ? aggregateOfNodes(progress.nodes) : null,
        report: null,
      }
    }
    case "saved":
      return {
        graph: graphFromScore(source.score, source.changed),
        states: {
          turns: turnsIn(() => ({ state: "done", questions: null })),
          aggregate: "done",
          report: source.writing ? "running" : source.score.report ? "done" : "none",
        },
        aggregate: aggregateOfScore(source.score),
        report: source.score.report,
      }
  }
}
