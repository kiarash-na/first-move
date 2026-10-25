import "server-only"
import type { Proposal } from "@/lib/ai/extract/propose"
import { patchesBySource } from "@/lib/ai/provenance/mark"
import { applyPatch, BUILDING_TYPES, CONSTRUCTION_PERIODS, type Project, type ProjectPatch } from "@/lib/project"

/** One value the agent put into the draft, with where it was read. */
export interface AppliedValue {
  key: string
  label: string
  value: unknown
  files: string[]
}

export interface Applied {
  project: Project
  values: AppliedValue[]
}

const SHARES = "buildings.shares."
/** Shares that add up to this (± half a point) describe the whole building stock. */
const WHOLE = 100

/**
 * A complete new building mix replaces the old one: when the shares an email gives add up to
 * 100 %, every other cell is cleared, so "60/30/10" after "50/50" does not add up to 200 %. A
 * single corrected cell changes only that cell.
 */
function clearOldShares(project: Project, patch: ProjectPatch): ProjectPatch {
  const given = Object.entries(patch).filter(([key]) => key.startsWith(SHARES))
  const sum = given.reduce((total, [, value]) => total + (typeof value === "number" ? value : 0), 0)
  if (given.length === 0 || Math.abs(sum - WHOLE) > 0.5) return {}
  const keep = new Set(given.map(([key]) => key))
  const cleared: Record<string, null> = {}
  for (const type of BUILDING_TYPES) {
    for (const period of CONSTRUCTION_PERIODS) {
      const key = `${SHARES}${type}.${period}`
      if (!keep.has(key) && project.buildings.shares[type][period] !== null) cleared[key] = null
    }
  }
  return cleared
}

/**
 * Applies the valid part of a proposal to the draft (PLAN-AGENT-07 step 8) through `applyPatch`,
 * one patch per source document, each value marked as proposed by the email agent with the model
 * and the file (`provenance`), so the dashboard shows the AI mark after import (D-05, D-13).
 */
export function applyProposal(project: Project, proposal: Proposal, { model, now }: { model: string; now: Date }): Applied {
  let draft = project
  const cleared = clearOldShares(project, proposal.patch)
  if (Object.keys(cleared).length) draft = applyPatch(draft, cleared, { now }).project
  const sourced = proposal.valid.map((entry) => ({ key: entry.key, value: entry.value, files: entry.sources.flatMap((source) => (source.file ? [source.file] : [])) }))
  const applied = new Set<string>()
  for (const { patch, provenance } of patchesBySource(sourced, "email", model)) {
    const result = applyPatch(draft, patch, { now, provenance })
    draft = result.project
    for (const key of result.applied) applied.add(key)
  }
  const values = proposal.valid
    .filter((entry) => applied.has(entry.key))
    .map((entry) => ({ key: entry.key, label: entry.label, value: entry.value, files: [...new Set(entry.sources.flatMap((source) => (source.file ? [source.file] : [])))] }))
  return { project: draft, values }
}
