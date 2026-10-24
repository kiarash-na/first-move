import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { I18nProvider } from "../_components/i18n-provider"
import { testDictionaries } from "../_components/test-utils/dictionaries"
import { ProjectRow } from "./project-row"

const summary = {
  id: "p1",
  name: "",
  createdAt: "2026-10-20T08:00:00.000Z",
  updatedAt: "2026-10-20T08:00:00.000Z",
  modules: { quickCheck: true, businessPlan: false },
  exampleId: "new-build-quarter",
}

describe("ProjectRow", () => {
  it.each(["en", "de"] as const)("shows the project and calls its actions (%s)", async (lang) => {
    const actions = { onOpen: vi.fn(), onDuplicate: vi.fn(), onDelete: vi.fn() }
    const { start, shell } = testDictionaries(lang)
    render(
      <I18nProvider lang={lang} dictionaries={testDictionaries(lang)}>
        <TooltipProvider>
          <ul>
            <ProjectRow project={summary} current {...actions} />
          </ul>
        </TooltipProvider>
      </I18nProvider>,
    )
    expect(screen.getByText(shell.fields.meta.name.placeholder)).toBeInTheDocument()
    expect(screen.getByText(`· ${start.projects.current}`)).toBeInTheDocument()
    expect(screen.getByText(shell.nav.example)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: start.projects.open }))
    await userEvent.click(screen.getByRole("button", { name: start.projects.duplicate }))
    await userEvent.click(screen.getByRole("button", { name: start.projects.delete }))
    expect(actions.onOpen).toHaveBeenCalled()
    expect(actions.onDuplicate).toHaveBeenCalled()
    expect(actions.onDelete).toHaveBeenCalled()
  })
})
