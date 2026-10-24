import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import en from "@/dictionaries/en/mail.json"
import { ConfirmForm } from "./confirm-form"

const copy = en.confirm

function answer(status: number) {
  const fetchMock = vi.fn(async () => new Response(null, { status }))
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

describe("ConfirmForm", () => {
  beforeEach(() => {
    window.location.hash = "#t=v1.token.123.sig"
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    window.location.hash = ""
  })

  it("posts nothing until the box is ticked and the button pressed", async () => {
    const fetchMock = answer(200)
    render(<ConfirmForm copy={copy} termsHref="/en/terms" />)
    const button = screen.getByRole("button", { name: copy.button })
    expect(button).toBeDisabled()
    expect(fetchMock).not.toHaveBeenCalled()
    await userEvent.click(screen.getByLabelText(copy.accept))
    expect(button).toBeEnabled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("confirms with the token from the fragment and shows the result", async () => {
    const fetchMock = answer(200)
    render(<ConfirmForm copy={copy} termsHref="/en/terms" />)
    await userEvent.click(screen.getByLabelText(copy.accept))
    await userEvent.click(screen.getByRole("button", { name: copy.button }))
    expect(fetchMock).toHaveBeenCalledWith("/api/mail/confirm", expect.objectContaining({ method: "POST", body: JSON.stringify({ token: "v1.token.123.sig" }) }))
    expect(await screen.findByText(copy.result.confirmed)).toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it.each([
    [410, copy.result.expired],
    [409, copy.result.used],
    [400, copy.result.invalid],
  ])("shows the copy for status %i and hides the form", async (status, text) => {
    answer(status)
    render(<ConfirmForm copy={copy} termsHref="/en/terms" />)
    await userEvent.click(screen.getByLabelText(copy.accept))
    await userEvent.click(screen.getByRole("button", { name: copy.button }))
    expect(await screen.findByText(text)).toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("keeps the form after an error, so the person can try again", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("offline"))))
    render(<ConfirmForm copy={copy} termsHref="/en/terms" />)
    await userEvent.click(screen.getByLabelText(copy.accept))
    await userEvent.click(screen.getByRole("button", { name: copy.button }))
    expect(await screen.findByText(copy.result.error)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: copy.button })).toBeEnabled()
  })

  it("links the Terms", () => {
    render(<ConfirmForm copy={copy} termsHref="/de/terms" />)
    expect(screen.getByRole("link", { name: copy.terms })).toHaveAttribute("href", "/de/terms")
  })

  it("asks for the link from the email when the page has no token", () => {
    window.location.hash = ""
    render(<ConfirmForm copy={copy} termsHref="/en/terms" />)
    expect(screen.getByText(copy.missing)).toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})
