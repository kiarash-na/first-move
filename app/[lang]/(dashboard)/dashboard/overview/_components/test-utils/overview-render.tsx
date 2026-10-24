import type { ReactElement } from "react"

import type { Locale } from "@/lib/i18n/locales"
import { localizeExample, getExample } from "@/lib/examples"
import { applyPatch, type Project, type ProjectPatch } from "@/lib/project"
import { run, type QuickCheckComplete } from "@/lib/quick-check"
import { renderDashboard } from "../../../_components/test-utils/render"
import { projectStore } from "../../../_components/test-utils/project-store"

/** Tests only: an example project (EN) with optional patches applied. */
export function exampleWith(id: string, patch: ProjectPatch = {}): Project {
  const project = localizeExample(getExample(id)!, "en")
  if (Object.keys(patch).length === 0) return project
  const result = applyPatch(project, patch, { atomic: true })
  if (!result.ok) throw new Error(`patch failed: ${JSON.stringify(result.errors)}`)
  return result.project
}

/** Tests only: the complete Quick Check run of a project. */
export function completeRun(project: Project): QuickCheckComplete {
  const result = run(project)
  if (result.status !== "complete") throw new Error("expected a complete Quick Check")
  return result
}

/** Tests only: renders `ui` with the project open in a store whose `patch` is real. */
export function renderOverview(ui: ReactElement, project: Project, lang: Locale = "en") {
  const harness = projectStore(project)
  return { ...renderDashboard(ui, { store: harness.store, lang }), harness }
}
