import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactElement } from "react"
import { describe, expect, it, vi } from "vitest"
import type { Locale } from "@/lib/i18n/locales"
import { FICTIONAL_DISCLAIMER } from "@/lib/examples/reference-cases"
import { REFERENCE_CASE_CARDS } from "@/lib/examples/reference-cases/catalog"
import { I18nProvider } from "../_components/i18n-provider"
import { testDictionaries } from "../_components/test-utils/dictionaries"
import { ReferenceCaseCard } from "./reference-case-card"

function renderCard(ui: ReactElement, { lang = "en" }: { lang?: Locale } = {}) {
  return render(
    <I18nProvider lang={lang} dictionaries={testDictionaries(lang)}>
      {ui}
    </I18nProvider>,
  )
}

const real = REFERENCE_CASE_CARDS.smartBlockGeblergasse
const fictional = REFERENCE_CASE_CARDS.klinikDonaustadt

describe("ReferenceCaseCard (D-76)", () => {
  it.each(["en", "de"] as const)("shows name, kind, designed quality and summary of a real case (%s)", (lang) => {
    const copy = testDictionaries(lang).start.referenceCases
    renderCard(<ReferenceCaseCard card={real} busy={false} onOpen={vi.fn()} />, { lang })
    const card = screen.getByRole("article", { name: real.name[lang] ?? real.name.en })
    expect(card).toHaveAttribute("data-reference-case", real.id)
    expect(within(card).getByText(copy.kinds.real)).toBeInTheDocument()
    expect(within(card).getByText(copy.quality)).toBeInTheDocument()
    expect(within(card).getByText(copy.tiers.strong)).toBeInTheDocument()
    expect(within(card).getByText(real.summary[lang]!)).toBeInTheDocument()
    expect(card.querySelector("[data-disclaimer]")).toBeNull()
  })

  it.each(["en", "de"] as const)("carries the disclaimer on a fictional case (%s)", (lang) => {
    const copy = testDictionaries(lang).start.referenceCases
    expect(copy.disclaimer).toBe(FICTIONAL_DISCLAIMER[lang])
    renderCard(<ReferenceCaseCard card={fictional} busy={false} onOpen={vi.fn()} />, { lang })
    const card = screen.getByRole("article", { name: fictional.name[lang] })
    expect(within(card).getByText(copy.kinds.fictional)).toBeInTheDocument()
    expect(within(card).getByText(copy.disclaimer)).toBeInTheDocument()
  })

  it("fills one segment of the quality meter per tier step", () => {
    renderCard(<ReferenceCaseCard card={REFERENCE_CASE_CARDS.ottakringerBad} busy={false} onOpen={vi.fn()} />)
    const card = screen.getByRole("article")
    expect(card.querySelectorAll('[data-filled="true"]')).toHaveLength(2)
    expect(card.querySelectorAll('[data-filled="false"]')).toHaveLength(1)
  })

  it.each([
    ["en", "/en/docs/reference-cases#klinik-donaustadt-fictional-groundwater-loop"],
    ["de", "/de/docs/reference-cases#klinik-donaustadt-fiktives-grundwassernetz"],
  ] as const)("links to its section of the public docs page (%s)", (lang, href) => {
    const copy = testDictionaries(lang).start.referenceCases
    renderCard(<ReferenceCaseCard card={fictional} busy={false} onOpen={vi.fn()} />, { lang })
    expect(screen.getByRole("link", { name: copy.sources })).toHaveAttribute("href", href)
  })

  it("asks to open a copy, and not while another case is opening", async () => {
    const onOpen = vi.fn()
    const copy = testDictionaries().start.referenceCases
    const { unmount } = renderCard(<ReferenceCaseCard card={real} busy={false} onOpen={onOpen} />)
    await userEvent.click(screen.getByRole("button", { name: copy.open }))
    expect(onOpen).toHaveBeenCalledWith(real.id)
    unmount()
    renderCard(<ReferenceCaseCard card={real} busy={true} onOpen={onOpen} />)
    expect(screen.getByRole("button", { name: copy.open })).toBeDisabled()
  })
})
