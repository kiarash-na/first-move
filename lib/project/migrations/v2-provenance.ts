import type { Migration } from "./types"

/**
 * Version 2 (PLAN-AGENT-01): adds the system-managed `provenance` section, which records the
 * values an AI proposed and the user accepted. Older projects have none, so it starts empty.
 */
export const v2Provenance: Migration = {
  version: 2,
  description: "Adds provenance ({ ai: {} }): which values an AI proposed.",
  up: (project) => ({ ...project, provenance: { ai: {} } }),
}
