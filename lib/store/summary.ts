import type { Project } from "@/lib/project"
import type { ProjectSummary } from "./state"

export function toSummary(project: Project): ProjectSummary {
  const { id, name, createdAt, updatedAt, modules, exampleId } = project.meta
  return { id, name, createdAt, updatedAt, modules, exampleId }
}

/** Most recently changed first; ties by id, so the order is stable. */
export function sortSummaries(list: readonly ProjectSummary[]): ProjectSummary[] {
  return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id))
}

const same = (a: ProjectSummary, b: ProjectSummary) =>
  a.name === b.name &&
  a.updatedAt === b.updatedAt &&
  a.createdAt === b.createdAt &&
  a.exampleId === b.exampleId &&
  a.modules.quickCheck === b.modules.quickCheck &&
  a.modules.businessPlan === b.modules.businessPlan

/** Adds or replaces a summary; returns the same list when nothing changed. */
export function upsertSummary(list: readonly ProjectSummary[], summary: ProjectSummary): readonly ProjectSummary[] {
  const existing = list.find((entry) => entry.id === summary.id)
  if (existing && same(existing, summary)) return list
  return sortSummaries([...list.filter((entry) => entry.id !== summary.id), summary])
}

/** Removes a summary; returns the same list when it was not there. */
export function removeSummary(list: readonly ProjectSummary[], id: string): readonly ProjectSummary[] {
  return list.some((entry) => entry.id === id) ? list.filter((entry) => entry.id !== id) : list
}
