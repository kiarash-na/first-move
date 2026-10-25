import type { Migration } from "./types"

/**
 * Version 3 (PLAN-AI-SCORE-00, D-73): adds the system-managed `aiScore` section, the last AI Plan
 * Score of the project. Older projects were never scored, so it starts as null.
 */
export const v3AiScore: Migration = {
  version: 3,
  description: "Adds aiScore (null): the last AI Plan Score.",
  up: (project) => ({ ...project, aiScore: null }),
}
