import "server-only"
import { blockedGate } from "./blocked"
import { budgetGate } from "./budget"
import { dmarcGate } from "./dmarc"
import { doneGate } from "./done"
import { loopGate } from "./loops"
import { rateLimitGate } from "./rate-limit"
import { sizeGate } from "./size"
import { pass, type Gate, type GateContext, type GateResult } from "./types"

/**
 * The deterministic gates in order (PLAN-AGENT-06 step 7): cheap and silent checks first, so a
 * forged or automated email never counts against a sender's limits. The first drop wins.
 */
export const GATES: readonly Gate[] = [doneGate, dmarcGate, loopGate, blockedGate, rateLimitGate, sizeGate, budgetGate]

/** For an email that waited for consent: it counted against the limits when it arrived. */
export const RESUMED_GATES: readonly Gate[] = GATES.filter((gate) => gate !== rateLimitGate)

export async function runGates(context: GateContext, gates: readonly Gate[] = GATES): Promise<GateResult> {
  for (const gate of gates) {
    const result = await gate(context)
    if (!result.ok) return result
  }
  return pass
}
