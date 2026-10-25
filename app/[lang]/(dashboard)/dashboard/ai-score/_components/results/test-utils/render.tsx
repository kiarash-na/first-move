import { render, type RenderOptions } from "@testing-library/react"
import type { ReactElement, ReactNode } from "react"
import { vi } from "vitest"

import { TooltipProvider } from "@/components/ui/tooltip"
import aiScoreDe from "@/dictionaries/de/ai-score.json"
import aiScoreEn from "@/dictionaries/en/ai-score.json"
import { deepMerge } from "@/lib/i18n/deep-merge"
import type { Locale } from "@/lib/i18n/locales"
import { I18nProvider } from "../../../../_components/i18n-provider"
import { testDictionaries } from "../../../../_components/test-utils/dictionaries"
import type { ResultActions } from "../../types"

/** Tests only: the `ai-score` area as `getDictionary` returns it (DE merged over EN, D-32). */
export const aiScoreCopy = (lang: Locale = "en") => (lang === "en" ? aiScoreEn : deepMerge(aiScoreEn, aiScoreDe))

/** Tests only: the dashboard areas plus `ai-score`, as the AI Plan Score page has them. */
export const resultDictionaries = (lang: Locale = "en") => ({ ...testDictionaries(lang), "ai-score": aiScoreCopy(lang) })

/** Tests only: renders a result view inside the providers of the AI Plan Score page. */
export function renderResults(ui: ReactElement, { lang = "en", ...options }: Omit<RenderOptions, "wrapper"> & { lang?: Locale } = {}) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <I18nProvider lang={lang} dictionaries={resultDictionaries(lang)}>
        <TooltipProvider>{children}</TooltipProvider>
      </I18nProvider>
    )
  }
  return render(ui, { wrapper: Wrapper, ...options })
}

/** Tests only: result actions with spies; a key and a text model are ready and no run is in flight unless overridden. */
export function mockActions(overrides: Partial<ResultActions> = {}): ResultActions {
  return { canUseAi: true, running: false, busy: null, error: null, rewriteReport: vi.fn(), suggest: vi.fn(), remove: vi.fn(), ...overrides }
}
