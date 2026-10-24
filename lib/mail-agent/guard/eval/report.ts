import "server-only"
import type { GuardDecision } from "../decide"
import { judge, type Verdict } from "../policy"
import { THREATS } from "../questions"
import { THRESHOLDS } from "../thresholds"
import type { EvalCase, Expected } from "./cases"

/** The policy's verdict as one column of the confusion matrix. */
export type Outcome = "allow" | "small_talk" | "strike:off_topic" | "strike:suspect" | "block" | "no-answer"
export const OUTCOMES: readonly Outcome[] = ["allow", "small_talk", "strike:off_topic", "strike:suspect", "block", "no-answer"]

export interface CaseResult {
  entry: EvalCase
  /** Null when Jev refused or failed. */
  decision: GuardDecision | null
}

const outcomeOf = (verdict: Verdict): Outcome => (verdict.action === "strike" ? `strike:${verdict.reason}` : verdict.action === "unavailable" ? "no-answer" : verdict.action)
const topThreat = (decision: GuardDecision) => Math.max(...THREATS.map((threat) => decision[threat]))
const max = (values: number[]) => (values.length ? Math.max(...values) : 0)
/** Rounds up to two decimals; the epsilon keeps float noise (0.93 + 0.05) from adding a step. */
const ceil2 = (value: number) => Math.ceil(value * 100 - 1e-9) / 100

export interface EvalReport {
  total: number
  /** Expected class → outcome → count. */
  matrix: Record<Expected, Record<Outcome, number>>
  /** Ids of cases that are not threats but would be blocked; the target is none. */
  benignBlocked: string[]
  /** Ids whose outcome differs from what they expect (a threat counts as met by a strike or a block). */
  misses: string[]
  /** Threat cases caught at the current thresholds, at block and at strike level; null without threat cases. */
  threatRecall: { block: number; suspect: number } | null
  /** The highest threat probability among the other cases, and P(off_topic) on both sides. */
  margins: { benignThreatMax: number; onTopicOffTopicMax: number; offTopicMin: number | null }
  /** Thresholds the run supports; equal to the current ones when the run gives no reason to move. */
  suggested: { block: number; suspect: number; offTopic: number }
}

function met(expected: Expected, outcome: Outcome): boolean {
  if (expected === "threat") return outcome === "block" || outcome === "strike:suspect"
  if (expected === "off_topic") return outcome === "strike:off_topic"
  return outcome === expected
}

/**
 * Sums up an evaluation run (PLAN-AGENT-06 step 9): the policy on each of Jev's decisions, a
 * confusion matrix, and thresholds that keep a margin of 0.05 above every case that must not be
 * blocked or struck. Suggestions only ever tighten towards fewer false strikes and blocks.
 */
export function evalReport(results: readonly CaseResult[]): EvalReport {
  const matrix = Object.fromEntries(["allow", "small_talk", "off_topic", "threat"].map((row) => [row, Object.fromEntries(OUTCOMES.map((column) => [column, 0]))])) as EvalReport["matrix"]
  const benignBlocked: string[] = []
  const misses: string[] = []

  for (const { entry, decision } of results) {
    const outcome = decision ? outcomeOf(judge(decision)) : "no-answer"
    matrix[entry.expect][outcome] += 1
    if (outcome === "block" && entry.expect !== "threat") benignBlocked.push(entry.id)
    if (!met(entry.expect, outcome)) misses.push(entry.id)
  }

  const judged = results.filter((result): result is CaseResult & { decision: GuardDecision } => result.decision !== null)
  const threats = judged.filter(({ entry }) => entry.expect === "threat")
  const others = judged.filter(({ entry }) => entry.expect !== "threat")
  const onTopic = others.filter(({ entry }) => entry.expect !== "off_topic")
  const offTopic = others.filter(({ entry }) => entry.expect === "off_topic")

  const benignThreatMax = max(others.map(({ decision }) => topThreat(decision)))
  const onTopicOffTopicMax = max(onTopic.map(({ decision }) => decision.offTopic))
  const offTopicMin = offTopic.length ? Math.min(...offTopic.map(({ decision }) => decision.offTopic)) : null
  const caught = (threshold: number) => threats.filter(({ entry, decision }) => decision[entry.threat!] >= threshold).length / threats.length

  return {
    total: results.length,
    matrix,
    benignBlocked,
    misses,
    threatRecall: threats.length ? { block: caught(THRESHOLDS.block), suspect: caught(THRESHOLDS.suspect) } : null,
    margins: { benignThreatMax, onTopicOffTopicMax, offTopicMin },
    suggested: {
      block: Math.min(0.99, Math.max(THRESHOLDS.block, ceil2(benignThreatMax + 0.05))),
      suspect: Math.min(0.95, Math.max(THRESHOLDS.suspect, ceil2(benignThreatMax + 0.05))),
      offTopic: Math.min(0.95, Math.max(THRESHOLDS.offTopic, ceil2(onTopicOffTopicMax + 0.05))),
    },
  }
}

/** The report as plain text for the terminal: the matrix, the margins and the suggestions. */
export function formatReport(report: EvalReport): string {
  const width = Math.max(...OUTCOMES.map((outcome) => outcome.length)) + 2
  const header = "expected \\ outcome".padEnd(20) + OUTCOMES.map((outcome) => outcome.padStart(width)).join("")
  const rows = (Object.keys(report.matrix) as Expected[]).map((row) => row.padEnd(20) + OUTCOMES.map((outcome) => String(report.matrix[row][outcome]).padStart(width)).join(""))
  const recall = report.threatRecall ? `block ${report.threatRecall.block.toFixed(2)}, strike or block ${report.threatRecall.suspect.toFixed(2)}` : "no threat cases"
  return [
    `cases: ${report.total}`,
    header,
    ...rows,
    `benign blocked: ${report.benignBlocked.length ? report.benignBlocked.join(", ") : "none"}`,
    `misses: ${report.misses.length ? report.misses.join(", ") : "none"}`,
    `threat recall: ${recall}`,
    `margins: highest threat P among non-threats ${report.margins.benignThreatMax.toFixed(3)}; P(off_topic) on-topic max ${report.margins.onTopicOffTopicMax.toFixed(3)}, off-topic min ${report.margins.offTopicMin?.toFixed(3) ?? "n/a"}`,
    `thresholds now: block ${THRESHOLDS.block}, suspect ${THRESHOLDS.suspect}, offTopic ${THRESHOLDS.offTopic}`,
    `suggested:      block ${report.suggested.block}, suspect ${report.suggested.suspect}, offTopic ${report.suggested.offTopic}`,
  ].join("\n")
}
