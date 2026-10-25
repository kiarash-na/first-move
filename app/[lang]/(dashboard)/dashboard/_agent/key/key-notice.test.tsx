import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { assistantCopy } from "../test-utils/render"
import { KeyNotice } from "./key-notice"

describe.each(["en", "de"] as const)("KeyNotice (%s)", (lang) => {
  const copy = assistantCopy(lang).notice

  function Harness({ provider }: { provider: "gateway" | "openrouter" }) {
    const [checked, setChecked] = useState(false)
    return <KeyNotice copy={{ ...copy, ...copy[provider] }} checked={checked} onChange={setChecked} />
  }

  it.each(["gateway", "openrouter"] as const)("tells %s users to set a spending limit and an expiry date, with a link to the docs", (provider) => {
    render(<Harness provider={provider} />)
    const notice = screen.getByRole("region", { name: copy.title })
    expect(notice).toHaveTextContent(copy[provider].limit)
    expect(notice).toHaveTextContent(copy[provider].expiry)
    const link = screen.getByRole("link", { name: copy[provider].docs })
    expect(link).toHaveAttribute("href", copy[provider].docsUrl)
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
    expect(link).toHaveAttribute("target", "_blank")
  })

  it("needs its checkbox, and says so until it is ticked", async () => {
    render(<Harness provider="openrouter" />)
    const box = screen.getByRole("checkbox", { name: copy.ack })
    expect(box).toBeRequired()
    expect(box).toHaveAccessibleDescription(copy.required)
    await userEvent.click(box)
    expect(box).toBeChecked()
    expect(screen.queryByText(copy.required)).not.toBeInTheDocument()
  })
})
