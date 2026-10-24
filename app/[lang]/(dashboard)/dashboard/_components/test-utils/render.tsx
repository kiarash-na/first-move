import { render, type RenderOptions } from "@testing-library/react"
import type { ReactElement, ReactNode } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import type { Locale } from "@/lib/i18n/locales"
import type { ProjectStore } from "@/lib/store"
import { I18nProvider } from "../i18n-provider"
import { ProjectStoreProvider } from "../store-provider"
import { testDictionaries } from "./dictionaries"

export interface DashboardRenderOptions extends Omit<RenderOptions, "wrapper"> {
  lang?: Locale
  store: ProjectStore
}

/** Tests only: renders inside the providers the dashboard layout sets up. */
export function renderDashboard(ui: ReactElement, { lang = "en", store, ...options }: DashboardRenderOptions) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <I18nProvider lang={lang} dictionaries={testDictionaries(lang)}>
        <ProjectStoreProvider store={store}>
          <TooltipProvider>{children}</TooltipProvider>
        </ProjectStoreProvider>
      </I18nProvider>
    )
  }
  return render(ui, { wrapper: Wrapper, ...options })
}
