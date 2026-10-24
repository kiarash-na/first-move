import type { Migration } from "./types"

/**
 * Version 1: the first stored project shape (PLAN-DASH-03). Nothing older exists, so the
 * baseline changes nothing; it anchors the chain. A later shape change adds
 * `v2-<change>.ts` with `version: 2` and keeps `v1-baseline.fixture.json` migrating.
 */
export const v1Baseline: Migration = {
  version: 1,
  description: "Baseline: first project shape (meta, site, buildings, sources, quickCheck, businessPlan).",
  up: (project) => project,
}
