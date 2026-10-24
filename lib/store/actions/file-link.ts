import type { Project } from "@/lib/project"
import { buildExport } from "@/lib/storage/export"
import { fileLinkErrorCode } from "@/lib/storage/file-link"
import { exportFileName } from "@/lib/storage/file-name"
import { recordExport } from "@/lib/storage/reminder"
import type { StoreContext } from "../context"
import { removeNoticesOf } from "../notices"
import type { FileLinkInfo } from "../state"

const info = (ctx: StoreContext, patch: Partial<FileLinkInfo>): FileLinkInfo => ({
  supported: Boolean(ctx.rt?.fileApi),
  status: "off",
  fileName: null,
  error: null,
  ...patch,
})

/** Reads the active project's link and whether writing is still permitted (no prompt). */
export async function loadFileLink(ctx: StoreContext): Promise<void> {
  const rt = ctx.rt
  const id = ctx.get().activeId
  if (!rt) return
  rt.fileRecord = null
  rt.fileHandle = null
  if (!rt.fileApi || !id) {
    ctx.set({ fileLink: info(ctx, {}) })
    return
  }
  let record = null
  try {
    record = await rt.repo.fileLinks.get(id)
  } catch {
    record = null
  }
  if (ctx.get().activeId !== id) return
  if (!record) {
    ctx.set({ fileLink: info(ctx, {}) })
    return
  }
  let permission: PermissionState
  try {
    permission = await rt.fileApi.permission(record.handle, false)
  } catch {
    permission = "denied"
  }
  if (ctx.get().activeId !== id) return
  rt.fileRecord = record
  rt.fileHandle = permission === "granted" ? record.handle : null
  ctx.set({ fileLink: info(ctx, { status: permission === "granted" ? "on" : "needs-permission", fileName: record.fileName }) })
}

/** Writes the project to the linked file, after any write still running. Counts as an export. */
export function writeLinkedFile(ctx: StoreContext, project: Project): Promise<void> {
  const rt = ctx.rt
  if (!rt?.fileApi) return Promise.resolve()
  const api = rt.fileApi
  rt.fileWrites = rt.fileWrites.then(async () => {
    const handle = rt.fileHandle
    const id = project.meta.id
    if (!handle || ctx.get().activeId !== id) return
    try {
      const now = ctx.deps.now()
      await api.write(handle, buildExport(project, now).text)
      await rt.repo.updateBackup(id, (state) => recordExport(state, now))
      ctx.set((state) => ({
        fileLink: { ...state.fileLink, status: "on", error: null },
        notices: removeNoticesOf(state.notices, id, "export-reminder"),
      }))
    } catch (error) {
      const code = fileLinkErrorCode(error)
      if (code === "permission") rt.fileHandle = null
      ctx.set((state) => ({
        fileLink: { ...state.fileLink, status: code === "permission" ? "needs-permission" : "error", error: code },
      }))
    }
  })
  return rt.fileWrites
}

/** Asks where to save, links the file and writes it. Call from a click. False when cancelled. */
export async function linkFile(ctx: StoreContext): Promise<boolean> {
  const rt = await ctx.ready()
  const project = ctx.get().active
  if (!rt.fileApi || !project) return false
  let handle: FileSystemFileHandle | null
  try {
    handle = await rt.fileApi.pick(exportFileName(project.meta.name, ctx.deps.now()))
  } catch (error) {
    ctx.set({ fileLink: info(ctx, { status: "error", error: fileLinkErrorCode(error) }) })
    return false
  }
  if (!handle) return false
  const record = { projectId: project.meta.id, handle, fileName: handle.name, linkedAt: ctx.deps.now().toISOString() }
  try {
    await rt.repo.fileLinks.put(record)
  } catch {
    // The link still works for this visit; it is asked again after a reload.
  }
  rt.fileRecord = record
  rt.fileHandle = handle
  ctx.set({ fileLink: info(ctx, { status: "on", fileName: record.fileName }) })
  await writeLinkedFile(ctx, ctx.get().active ?? project)
  return ctx.get().fileLink.status === "on"
}

/** After a reload the browser asks again before writing; call from a click. */
export async function resumeFileLink(ctx: StoreContext): Promise<boolean> {
  const rt = await ctx.ready()
  const record = rt.fileRecord
  const project = ctx.get().active
  if (!rt.fileApi || !record || !project) return false
  let permission: PermissionState
  try {
    permission = await rt.fileApi.permission(record.handle, true)
  } catch {
    permission = "denied"
  }
  if (permission !== "granted") {
    ctx.set({ fileLink: info(ctx, { status: "needs-permission", fileName: record.fileName, error: "permission" }) })
    return false
  }
  rt.fileHandle = record.handle
  ctx.set({ fileLink: info(ctx, { status: "on", fileName: record.fileName }) })
  await writeLinkedFile(ctx, project)
  return ctx.get().fileLink.status === "on"
}

/** Stops writing to the file (the file itself stays on disk). */
export async function unlinkFile(ctx: StoreContext): Promise<void> {
  const rt = await ctx.ready()
  const id = ctx.get().activeId
  rt.fileRecord = null
  rt.fileHandle = null
  if (id) {
    try {
      await rt.repo.fileLinks.delete(id)
    } catch {
      // Nothing linked any more for this visit.
    }
  }
  ctx.set({ fileLink: info(ctx, {}) })
}
