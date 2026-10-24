import "server-only"

/**
 * The guard's thresholds (PLAN-AGENT-06 step 9). Code constants on purpose: change them only after
 * a run of the evaluation set (`guard/eval`), and record the run in a note.
 */
export const THRESHOLDS = {
  /** P(threat) at or above this blocks the sender for good (D-55). */
  block: 0.9,
  /** P(threat) at or above this, below `block`, is a strike, and the email is not acted on. */
  suspect: 0.6,
  /** P(off_topic) at or above this is a strike. */
  offTopic: 0.7,
} as const
