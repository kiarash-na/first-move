import { projectSchema, TEXT_LIMITS, type Project } from "@/lib/project"

export interface CopyOptions {
  id: string
  now: Date
  /** Defaults to the source's name; cut to the name limit. */
  name?: string
}

/**
 * A new project with the same inputs (duplicate, example pick, import as copy): new id and
 * timestamps; the example link is kept. Row ids stay, they are unique per project only.
 */
export function copyProject(source: Project, { id, now, name }: CopyOptions): Project {
  const at = now.toISOString()
  return projectSchema.parse({
    ...source,
    meta: { ...source.meta, id, name: (name ?? source.meta.name).slice(0, TEXT_LIMITS.name), createdAt: at, updatedAt: at },
  })
}

/** The same project marked as changed now (restore, undo delete, import). */
export function touchProject(project: Project, now: Date): Project {
  return { ...project, meta: { ...project.meta, updatedAt: now.toISOString() } }
}
