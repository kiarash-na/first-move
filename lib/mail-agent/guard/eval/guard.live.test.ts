// @vitest-environment node
import { writeFileSync } from "node:fs"
import { createGateway } from "ai"
import { describe, expect, it } from "vitest"
import { decideGuard } from "../decide"
import { guardState } from "../state"
import { caseEmail, loadCases } from "./cases"
import { evalReport, formatReport, type CaseResult } from "./report"

/**
 * The guard on the labelled cases with real Jev (PLAN-AGENT-06 step 9), only when switched on:
 * `MAIL_AGENT_LIVE_GUARD=1 node --env-file=.env.local ./node_modules/vitest/vitest.mjs run --silent=false
 * lib/mail-agent/guard/eval/guard.live.test.ts` with `AI_GATEWAY_API_KEY` set. Prints the
 * confusion matrix and suggested thresholds; `MAIL_AGENT_EVAL_OUT=<file>` also writes the report
 * as JSON (ids and numbers only). A run costs well under a cent.
 */
const apiKey = process.env.AI_GATEWAY_API_KEY
const live = process.env.MAIL_AGENT_LIVE_GUARD === "1" && Boolean(apiKey)
const modelId = process.env.EMAIL_AGENT_DECISION_MODEL || "typesafe-ai/jev-1.14.0"

describe.skipIf(!live)("guard evaluation (live)", () => {
  it("blocks no benign case", async () => {
    const model = createGateway({ apiKey: apiKey! }).decisionModel(modelId)
    const results: CaseResult[] = []
    for (const entry of loadCases()) {
      const result = await decideGuard(model, guardState(caseEmail(entry), "new"))
      results.push({ entry, decision: result.ok ? result.decision : null })
    }
    const report = evalReport(results)
    console.log(`model: ${modelId}\n${formatReport(report)}`)
    if (process.env.MAIL_AGENT_EVAL_OUT) {
      const decisions = results.map(({ entry, decision }) => ({ id: entry.id, expect: entry.expect, decision }))
      writeFileSync(process.env.MAIL_AGENT_EVAL_OUT, JSON.stringify({ model: modelId, report, decisions }, null, 2))
    }
    expect(report.benignBlocked).toEqual([])
  }, 300_000)
})
