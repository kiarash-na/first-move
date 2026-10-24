import Link from "next/link"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import en from "@/dictionaries/en/common.json"
import { NotFoundView } from "./not-found-view"

describe("NotFoundView", () => {
  it("shows the code, title, body and the given links", () => {
    render(
      <NotFoundView copy={en.notFound}>
        <Link href="/en">{en.notFound.home}</Link>
      </NotFoundView>,
    )
    expect(screen.getByText(en.notFound.code)).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1, name: en.notFound.title })).toBeInTheDocument()
    expect(screen.getByText(en.notFound.body)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: en.notFound.home })).toHaveAttribute("href", "/en")
  })
})
