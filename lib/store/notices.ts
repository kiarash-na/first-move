import type { NoticeKind, StorageNotice } from "./state"

export interface NoticeInput {
  kind: NoticeKind
  projectId?: string | null
  count?: number | null
}

/** Adds a notice; one of the same kind and project replaces the older one (no toast floods). */
export function addNotice(list: readonly StorageNotice[], input: NoticeInput, id: number): readonly StorageNotice[] {
  const notice: StorageNotice = { id, kind: input.kind, projectId: input.projectId ?? null, count: input.count ?? null }
  return [...list.filter((entry) => entry.kind !== notice.kind || entry.projectId !== notice.projectId), notice]
}

export function removeNotice(list: readonly StorageNotice[], id: number): readonly StorageNotice[] {
  return list.some((entry) => entry.id === id) ? list.filter((entry) => entry.id !== id) : list
}

/** Removes the notices of a project, optionally of one kind. */
export function removeNoticesOf(list: readonly StorageNotice[], projectId: string, kind?: NoticeKind): readonly StorageNotice[] {
  const keep = (entry: StorageNotice) => entry.projectId !== projectId || (kind !== undefined && entry.kind !== kind)
  return list.every(keep) ? list : list.filter(keep)
}
