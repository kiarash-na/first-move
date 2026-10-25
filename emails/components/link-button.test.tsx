// @vitest-environment node
import { describe, expect, it } from "vitest"
import { renderHtml } from "../render/html"
import { renderText } from "../render/text"
import { LinkButton } from "./link-button"

const href = "https://firstmove.energy/en/mail/confirm#t=abc"

describe("LinkButton", () => {
  it("is a link, with the full address for clients that hide buttons", () => {
    const node = <LinkButton label="Confirm my request" href={href} hint="If the button does not work, open this link:" />
    expect(renderHtml(node)).toContain(`<a href="${href}"`)
    // The text version shows the address once, after the label.
    expect(renderText(node)).toBe(`Confirm my request (${href})`)
  })

  it("drops a link that is not https", () => {
    expect(renderHtml(<LinkButton label="Open" href="javascript:alert(1)" />)).not.toContain("href")
  })
})
