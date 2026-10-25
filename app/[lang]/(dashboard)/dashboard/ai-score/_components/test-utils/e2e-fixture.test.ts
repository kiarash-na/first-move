import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { aiScoreStatus } from "@/lib/business-plan"
import { aiScoreSchema } from "@/lib/project"
import { parseImportText } from "@/lib/storage/import"

const FIXTURE = path.join(process.cwd(), "e2e", "fixtures", "ai-score.firstmove.json")

/**
 * The e2e fixture (`e2e/ai-score.spec.ts`) was written by the engine with the mock Jev and the
 * mock text model. It must stay an importable export whose score is valid and current, or the
 * e2e test would fail for the wrong reason.
 */
describe("AI Plan Score e2e fixture", () => {
  it("imports as a project with a valid, current AI Plan Score", () => {
    const result = parseImportText(readFileSync(FIXTURE, "utf8"))
    if (!result.ok) throw new Error(`fixture does not import: ${result.code} ${JSON.stringify(result.errors)}`)
    const score = aiScoreSchema.parse(result.project.aiScore)
    expect(aiScoreStatus(result.project).state).toBe("current")
    expect(score.report).not.toBeNull()
    expect(new Set(score.gates.map((gate) => gate.outcome))).toEqual(new Set(["pass", "fail", "unclear", "skipped"]))
  })
})
