import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { GATEWAY_ERROR_CODES } from "@/lib/assistant/gateway/errors"
import { RequestError } from "./request-error"
import { aiScoreCopy, renderResults } from "./test-utils/render"

describe("RequestError", () => {
  it.each(["en", "de"] as const)("has copy for every Gateway error code (%s)", (lang) => {
    const copy = aiScoreCopy(lang).results.errors
    for (const code of GATEWAY_ERROR_CODES) expect(copy[code], code).toBeTruthy()
  })

  it.each(GATEWAY_ERROR_CODES)("shows the copy of %s as an alert", (code) => {
    renderResults(<RequestError code={code} />)
    expect(screen.getByRole("alert")).toHaveTextContent(aiScoreCopy("en").results.errors[code])
  })

  it("renders nothing without an error", () => {
    const { container } = renderResults(<RequestError code={null} />)
    expect(container).toBeEmptyDOMElement()
  })
})
