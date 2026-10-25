import type { ReactElement } from "react"
import { vi } from "vitest"

import assistantDe from "@/dictionaries/de/assistant.json"
import assistant from "@/dictionaries/en/assistant.json"
import { deepMerge } from "@/lib/i18n/deep-merge"
import type { Locale } from "@/lib/i18n/locales"
import { applyPatch, type PatchProvenance, type Project, type ProjectPatch } from "@/lib/project"
import type { ProjectStore } from "@/lib/store"
import { I18nProvider } from "../../_components/i18n-provider"
import { fakeStore } from "../../_components/test-utils/fake-store"
import { projectStore } from "../../_components/test-utils/project-store"
import { renderDashboard } from "../../_components/test-utils/render"

/** Tests only: the `assistant` area as `getDictionary` returns it (DE merged over EN, D-32). */
export function assistantCopy(lang: Locale = "en") {
  return lang === "en" ? assistant : deepMerge(assistant, assistantDe)
}

/** Tests only: renders inside the dashboard providers plus the `assistant` area the layout adds while live. */
export function renderAgent(ui: ReactElement, { store, lang = "en" }: { store?: ProjectStore; lang?: Locale } = {}) {
  const wrap = (element: ReactElement) => (
    <I18nProvider lang={lang} dictionaries={{ assistant: assistantCopy(lang) }}>
      {element}
    </I18nProvider>
  )
  const result = renderDashboard(wrap(ui), { store: store ?? fakeStore({}).store, lang })
  return { ...result, rerender: (next: ReactElement) => result.rerender(wrap(next)) }
}

/** Tests only: a store with `project` open whose `applyProposal` runs the real `applyPatch` with provenance. */
export function agentStore(project: Project) {
  const fake = projectStore(project)
  const applyProposal = vi.fn((patch: ProjectPatch, provenance: PatchProvenance) => {
    const active = fake.store.getState().active
    if (!active) return null
    const result = applyPatch(active, patch, { provenance })
    if (result.project !== active) fake.set({ active: result.project })
    return result
  })
  Object.assign(fake.store, { applyProposal })
  return { ...fake, applyProposal }
}
