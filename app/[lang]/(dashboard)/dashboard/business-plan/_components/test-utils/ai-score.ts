import { fieldValueHash } from "@/lib/business-plan"
import { aiScoreSchema, type AiScore, type Project } from "@/lib/project"

/** The fields the test score read, one judgement each. */
const READ = [["businessPlan.opportunity.painPoint"], ["businessPlan.opportunity.needs"], ["businessPlan.risks"]] as const

/**
 * Tests only: a saved AI Plan Score (D-73) for `project`, hashed from its current fields, so it
 * is current until one of them changes. 62.4 ± 7.6 shows as 60 ± 8. Built by hand: core tests
 * never import the AI layer.
 */
export function testAiScore(project: Project, overrides: Partial<AiScore> = {}): AiScore {
  return aiScoreSchema.parse({
    method: "1.0.0",
    at: "2026-10-25T09:00:00.000Z",
    decisionModel: "test/decision-model",
    score: 62.4,
    sd: 7.6,
    level: "promising",
    capped: false,
    dimensions: [],
    judgements: READ.map((fields, index) => ({
      id: `part-${index + 1}`,
      fields: [...fields],
      hash: fieldValueHash(project, fields),
      source: "model",
      level: 2,
      probabilities: [0, 0.1, 0.8, 0.1, 0],
    })),
    gates: [],
    branches: [],
    quickCheck: null,
    usage: { decisionTokens: 1200, textTokens: 0 },
    report: null,
    suggestions: null,
    ...overrides,
  })
}

/** Tests only: `project` with a test score saved in it. */
export function withAiScore(project: Project, overrides: Partial<AiScore> = {}): Project {
  return { ...project, aiScore: testAiScore(project, overrides) }
}
