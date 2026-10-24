import type { Project } from "@/lib/project"
import { buildExport, type ExportFile } from "@/lib/storage/export"
import { readImportFile, type ImportFailure, type ImportSuccess } from "@/lib/storage/import"
import { recordExport } from "@/lib/storage/reminder"
import type { StoreContext } from "../context"
import { copyProject, touchProject } from "../copy-project"
import { removeNoticesOf } from "../notices"
import { requestPersistenceOnce } from "./health"
import { showProject } from "./projects"
import { persistNow, settle } from "./saving"

/**
 * Exports a project as `.firstmove.json` (D-13; the active one by default). The UI saves the
 * returned file with `downloadFile`. Resets the export reminder.
 */
export async function exportProject(ctx: StoreContext, id?: string): Promise<ExportFile | null> {
  const rt = await ctx.ready()
  const { activeId, active } = ctx.get()
  const projectId = id ?? activeId
  if (!projectId) return null
  await settle(rt, projectId)
  const project = projectId === activeId && active ? active : await rt.repo.read(projectId)
  if (!project) return null
  const now = ctx.deps.now()
  const file = buildExport(project, now)
  await rt.repo.updateBackup(projectId, (state) => recordExport(state, now)).catch(() => undefined)
  ctx.set((state) => ({ notices: removeNoticesOf(state.notices, projectId, "export-reminder") }))
  return file
}

/** What to do when the file's project id already exists here. */
export type ImportConflict = "copy" | "replace"

export interface ImportFileOptions {
  /** copy (default): keep both, the import gets a new id · replace: overwrite (old state kept as snapshot). */
  onConflict?: ImportConflict
  /** Open the imported project (default true). */
  open?: boolean
}

export type ImportOutcome =
  | ImportFailure
  | (ImportSuccess & {
      /** An existing project with the same id was replaced. */
      replaced: boolean
      /** The id existed, so the project was added as a copy with a new id. */
      copied: boolean
    })

/** Adds a validated import (results are recomputed from its inputs, D-13). */
export async function adoptImport(ctx: StoreContext, result: ImportSuccess, { onConflict = "copy", open = true }: ImportFileOptions = {}) {
  const rt = await ctx.ready()
  const now = ctx.deps.now()
  const exists = ctx.get().projects.some((entry) => entry.id === result.project.meta.id)
  const replaced = exists && onConflict === "replace"
  const copied = exists && !replaced
  let project: Project
  if (copied) {
    project = copyProject(result.project, { id: ctx.deps.newId(), now })
  } else {
    project = touchProject(result.project, now)
    if (replaced) await settle(rt, project.meta.id)
  }
  await persistNow(ctx, rt, project, replaced ? { snapshotReason: "before-import" } : {})
  if (open) await showProject(ctx, rt, project)
  void requestPersistenceOnce(ctx)
  return { ...result, project, replaced, copied }
}

/** Reads, validates and adds a picked or dropped file (size limit, schema, migrations; D-14). */
export async function importFile(ctx: StoreContext, file: Blob, options: ImportFileOptions = {}): Promise<ImportOutcome> {
  const result = await readImportFile(file)
  if (!result.ok) return result
  return adoptImport(ctx, result, options)
}
