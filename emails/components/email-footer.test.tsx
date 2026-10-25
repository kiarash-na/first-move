// @vitest-environment node
import { describe, expect, it } from "vitest"
import { renderHtml } from "../render/html"
import { renderText } from "../render/text"
import { EmailFooter } from "./email-footer"

const footer = {
  ai: "Written by an AI system. It can be wrong and is not binding.",
  human: "Privacy or legal requests, or anything for a person: {address}",
  humanAddress: "human@mail.firstmove.energy",
  links: [
    { label: "Terms", href: "https://firstmove.energy/en/terms" },
    { label: "Privacy Policy", href: "https://firstmove.energy/en/privacy" },
  ],
  commands: "Reply “new” to start over.",
}

const node = (
  <table>
    <tbody>
      <tr>
        <EmailFooter footer={footer} />
      </tr>
    </tbody>
  </table>
)

describe("EmailFooter", () => {
  it("discloses the AI, names human@ and links the Terms and the Privacy Policy", () => {
    expect(renderHtml(node)).toContain('href="mailto:human@mail.firstmove.energy"')
    expect(renderText(node)).toBe(
      [
        "Written by an AI system. It can be wrong and is not binding.",
        "Privacy or legal requests, or anything for a person: human@mail.firstmove.energy",
        "Reply “new” to start over.",
        "Terms (https://firstmove.energy/en/terms) · Privacy Policy (https://firstmove.energy/en/privacy)",
      ].join("\n\n"),
    )
  })
})
