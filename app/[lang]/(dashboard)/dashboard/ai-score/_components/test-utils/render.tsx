import type { ReactElement } from "react"
import { vi } from "vitest"

import aiScoreDe from "@/dictionaries/de/ai-score.json"
import aiScore from "@/dictionaries/en/ai-score.json"
import { deepMerge } from "@/lib/i18n/deep-merge"
import type { Locale } from "@/lib/i18n/locales"
import type { AiScore, Project } from "@/lib/project"
import type { ProjectStore } from "@/lib/store"
import { I18nProvider } from "../../../_components/i18n-provider"
import { renderDashboard } from "../../../_components/test-utils/render"
import { projectStore } from "../../../_components/test-utils/project-store"

/** Tests only: the `ai-score` area as `getDictionary` returns it (DE merged over EN, D-32). */
export function aiScoreCopy(lang: Locale = "en") {
  return lang === "en" ? aiScore : deepMerge(aiScore, aiScoreDe)
}

/** Tests only: renders inside the dashboard providers plus the page's own `ai-score` area. */
export function renderAiScore(ui: ReactElement, { store, lang = "en" }: { store: ProjectStore; lang?: Locale }) {
  return renderDashboard(
    <I18nProvider lang={lang} dictionaries={{ "ai-score": aiScoreCopy(lang) }}>
      {ui}
    </I18nProvider>,
    { store, lang },
  )
}

/** Tests only: a store with `project` open whose `setAiScore` writes the section like the real action. */
export function aiScoreStore(project: Project) {
  const fake = projectStore(project)
  const setAiScore = vi.fn((projectId: string, score: AiScore | null) => {
    const active = fake.store.getState().active
    if (!active || active.meta.id !== projectId) return false
    fake.set({ active: { ...active, aiScore: score } })
    return true
  })
  Object.assign(fake.store, { setAiScore })
  return { ...fake, setAiScore }
}
