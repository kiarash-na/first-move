/**
 * The scripted demo of slide 7 (System 1 security). The probabilities are illustrative, written
 * for the demo, and no request is made. The thresholds and the verdicts follow the real guard:
 * `guard-demo.test.ts` checks them against `lib/mail-agent/guard/thresholds.ts` and `policy.ts`.
 */
export const GUARD_THRESHOLDS = { block: 0.9, suspect: 0.6, offTopic: 0.7 } as const

export const GUARD_SIGNALS = ["injection", "harassment", "malicious", "offTopic"] as const
export type GuardSignal = (typeof GUARD_SIGNALS)[number]

export type GuardVerdict = "allow" | "small_talk" | "strike" | "block"

export interface GuardSample {
  /** Copy key in `presentation.json` → `slides.systemOne.samples`. */
  id: "question" | "injection" | "offTopic" | "smallTalk"
  topic: "first_move" | "small_talk" | "off_topic"
  /** Scripted probabilities, 0..1. `offTopic` is P(off_topic). */
  signals: Record<GuardSignal, number>
  verdict: GuardVerdict
}

export const GUARD_SAMPLES: readonly GuardSample[] = [
  { id: "question", topic: "first_move", signals: { injection: 0.03, harassment: 0.01, malicious: 0.02, offTopic: 0.02 }, verdict: "allow" },
  { id: "injection", topic: "first_move", signals: { injection: 0.97, harassment: 0.04, malicious: 0.41, offTopic: 0.18 }, verdict: "block" },
  { id: "offTopic", topic: "off_topic", signals: { injection: 0.05, harassment: 0.02, malicious: 0.14, offTopic: 0.96 }, verdict: "strike" },
  { id: "smallTalk", topic: "small_talk", signals: { injection: 0.01, harassment: 0.01, malicious: 0.01, offTopic: 0.06 }, verdict: "small_talk" },
]

/** The threshold drawn on a signal's bar: threats show the strike line, off topic its own. */
export const thresholdFor = (signal: GuardSignal) => (signal === "offTopic" ? GUARD_THRESHOLDS.offTopic : GUARD_THRESHOLDS.suspect)
