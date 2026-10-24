import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import common from "@/dictionaries/en/common.json"
import quickCheck from "@/dictionaries/en/quick-check.json"
import shell from "@/dictionaries/en/shell.json"
import { I18nProvider, useDictionary, useLocale, useTextRef } from "./i18n-provider"

function Probe() {
  const lang = useLocale()
  const shellCopy = useDictionary("shell")
  const label = useTextRef()
  return (
    <p>
      {lang} · {shellCopy.nav.start} · {label({ area: "quick-check", key: "fields.buildings.total" })} ·{" "}
      {String(label({ area: "business-plan", key: "fields.site" }))}
    </p>
  )
}

describe("I18nProvider", () => {
  it("gives client components the loaded areas, nested providers add areas", () => {
    render(
      <I18nProvider lang="de" dictionaries={{ common, shell }}>
        <I18nProvider lang="de" dictionaries={{ "quick-check": quickCheck }}>
          <Probe />
        </I18nProvider>
      </I18nProvider>,
    )
    expect(screen.getByText(`de · ${shell.nav.start} · ${quickCheck.fields.buildings.total.label} · null`)).toBeInTheDocument()
  })

  it("fails loudly when an area or the provider is missing", () => {
    expect(() => render(<Probe />)).toThrow("I18nProvider is missing")
    expect(() =>
      render(
        <I18nProvider lang="en" dictionaries={{ common }}>
          <Probe />
        </I18nProvider>,
      ),
    ).toThrow('Dictionary "shell" is not loaded')
  })
})
