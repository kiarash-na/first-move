import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import de from "@/dictionaries/de/mail.json"
import en from "@/dictionaries/en/mail.json"
import MailConfirmPage, { generateMetadata } from "./page"

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as PageProps<"/[lang]/mail/confirm">

describe("mail confirm page", () => {
  it("is titled from the mail copy and kept out of search engines", async () => {
    expect(await generateMetadata(props("en"))).toEqual({ title: en.confirm.title, robots: { index: false, follow: false } })
  })

  it("renders the title, the lead and the form with the Terms of its language", async () => {
    window.location.hash = "#t=v1.token"
    render(await MailConfirmPage(props("de")))
    expect(screen.getByRole("heading", { level: 1, name: de.confirm.title })).toBeInTheDocument()
    expect(screen.getByText(de.confirm.lead)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: de.confirm.terms })).toHaveAttribute("href", "/de/terms")
    window.location.hash = ""
  })
})
