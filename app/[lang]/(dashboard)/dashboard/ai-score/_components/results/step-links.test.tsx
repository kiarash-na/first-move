import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StepLinks } from "./step-links"
import { renderResults, resultDictionaries } from "./test-utils/render"

describe("StepLinks", () => {
  it.each(["en", "de"] as const)("links each step with its name (%s)", (lang) => {
    const names = resultDictionaries(lang).shell.nav.items.businessPlan
    renderResults(<StepLinks steps={["business-logic", "reality-check"]} template="Edit in {step}" />, { lang })
    expect(screen.getByRole("link", { name: `Edit in ${names["business-logic"]}` })).toHaveAttribute("href", `/${lang}/dashboard/business-plan/business-logic`)
    expect(screen.getByRole("link", { name: `Edit in ${names["reality-check"]}` })).toHaveAttribute("href", `/${lang}/dashboard/business-plan/reality-check`)
  })

  it("renders nothing without steps", () => {
    const { container } = renderResults(<StepLinks steps={[]} template="Edit in {step}" />)
    expect(container).toBeEmptyDOMElement()
  })
})
