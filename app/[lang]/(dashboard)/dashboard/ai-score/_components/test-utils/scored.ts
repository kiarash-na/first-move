import { JUDGEMENTS } from "@/lib/ai/plan-score/judgements"
import { scorePlan } from "@/lib/ai/plan-score/run"
import { mockJev, type MockJevAnswers } from "@/lib/ai/plan-score/test-utils/mock-jev"
import { getExample, localizeExample } from "@/lib/examples"
import type { AiScore, Project } from "@/lib/project"

/** Tests only: the clock of every run. */
export const NOW = () => new Date("2026-10-24T12:00:00.000Z")

/** Tests only: an example project (EN) as the app opens it. */
export const example = (id = "housing-cooperatives"): Project => localizeExample(getExample(id)!, "en")

/** Tests only: the same level distribution for every judgement. */
export const everyJudgement = (levels: number[]) => Object.fromEntries(JUDGEMENTS.map((judgement) => [judgement.id, levels]))

/**
 * Tests only: a real score of `project`, decided by the mock Jev (no network), with branches that
 * open follow-up checks so the flow has edges.
 */
export async function scored(project: Project = example(), answers: MockJevAnswers = {}): Promise<AiScore> {
  const jev = mockJev({ branches: { "anchor-type": "residential", "source-type": "groundwater", ownership: "community" }, ...answers })
  const { score } = await scorePlan(project, { decisionModel: jev.model, now: NOW })
  return score
}
