import { METHODOLOGY_VERSION, type Project } from "@/lib/project"
import { exportFileName } from "./file-name"

/** Marks a First Move export, so other JSON files are recognised and rejected on import. */
export const EXPORT_FORMAT = "first-move/project"

/** Version of the wrapper below; the project inside carries its own `schemaVersion`. */
export const EXPORT_FORMAT_VERSION = 1

export const EXPORT_MIME_TYPE = "application/json"

/**
 * A `.firstmove.json` file (D-13): the project's inputs with `meta.schemaVersion` and
 * `meta.methodologyVersion`. Results are never exported; they are recomputed after import.
 */
export interface ExportEnvelope {
  format: typeof EXPORT_FORMAT
  formatVersion: typeof EXPORT_FORMAT_VERSION
  exportedAt: string
  project: Project
}

export interface ExportFile {
  fileName: string
  mimeType: string
  text: string
}

/** The project as saved and exported: stamped with the methodology version of this app. */
export function withCurrentMethodology(project: Project): Project {
  if (project.meta.methodologyVersion === METHODOLOGY_VERSION) return project
  return { ...project, meta: { ...project.meta, methodologyVersion: METHODOLOGY_VERSION } }
}

export function buildExportEnvelope(project: Project, now: Date): ExportEnvelope {
  return {
    format: EXPORT_FORMAT,
    formatVersion: EXPORT_FORMAT_VERSION,
    exportedAt: now.toISOString(),
    project: withCurrentMethodology(project),
  }
}

/** The export file: readable, indented JSON. */
export function buildExport(project: Project, now: Date): ExportFile {
  return {
    fileName: exportFileName(project.meta.name, now),
    mimeType: EXPORT_MIME_TYPE,
    text: `${JSON.stringify(buildExportEnvelope(project, now), null, 2)}\n`,
  }
}
