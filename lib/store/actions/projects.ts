import { createProject, type CreateProjectOptions, type Project } from "@/lib/project"
import { rememberActive } from "../active-ids"
import type { Runtime, StoreContext } from "../context"
import { copyProject } from "../copy-project"
import { loadFileLink } from "./file-link"
import { requestPersistenceOnce } from "./health"
import { persistNow, restingSave, settle } from "./saving"

export interface AddOptions {
  /** Open the new project in this tab (default true). */
  open?: boolean
}

/** Makes a project that is already in memory the open one of this tab. */
export async function showProject(ctx: StoreContext, rt: Runtime, project: Project): Promise<void> {
  const id = project.meta.id
  rememberActive(rt.session, rt.local, id)
  ctx.set((state) => ({ activeId: id, active: project, lastUsedId: id, save: restingSave(state.mode, project) }))
  await loadFileLink(ctx)
}

/** Saves a new project and, by default, opens it. */
export async function addProject(ctx: StoreContext, rt: Runtime, project: Project, { open = true }: AddOptions = {}) {
  await persistNow(ctx, rt, project, {})
  if (open) await showProject(ctx, rt, project)
  void requestPersistenceOnce(ctx)
  return project
}

export type CreateOptions = Omit<CreateProjectOptions, "id" | "now"> & AddOptions

/** A new empty project for the chosen modules (start screen path tiles, D-03). */
export async function create(ctx: StoreContext, { open, ...options }: CreateOptions): Promise<Project> {
  const rt = await ctx.ready()
  const project = createProject({ ...options, id: ctx.deps.newId(), now: ctx.deps.now() })
  return addProject(ctx, rt, project, { open })
}

/** Adds a copy of a given project, e.g. a localized example (D-04: picking one creates a copy). */
export async function addCopy(ctx: StoreContext, source: Project, { name, open }: { name?: string } & AddOptions = {}) {
  const rt = await ctx.ready()
  return addProject(ctx, rt, copyProject(source, { id: ctx.deps.newId(), now: ctx.deps.now(), name }), { open })
}

/** Duplicates a stored project (D-29: compare models by duplicating). The UI passes the new name. */
export async function duplicate(ctx: StoreContext, id: string, { name, open = false }: { name?: string } & AddOptions = {}) {
  const rt = await ctx.ready()
  const { activeId, active } = ctx.get()
  await settle(rt, id)
  const source = activeId === id && active ? active : await rt.repo.read(id)
  if (!source) return null
  return addProject(ctx, rt, copyProject(source, { id: ctx.deps.newId(), now: ctx.deps.now(), name }), { open })
}
