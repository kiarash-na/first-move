import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import en from "@/dictionaries/en/legal.json"
import { THIRD_PARTY } from "@/lib/legal/third-party"
import { ThirdPartyTable } from "./third-party-table"

describe("ThirdPartyTable", () => {
  it("lists every shipped package with its licence in a named, scrollable region", () => {
    render(<ThirdPartyTable copy={en.thirdParty} />)
    const region = screen.getByRole("region", { name: en.thirdParty.caption })
    expect(within(region).getAllByRole("row")).toHaveLength(THIRD_PARTY.length + 1)
    expect(within(region).getByRole("link", { name: "next" })).toHaveAttribute("href", "https://nextjs.org")
    expect(within(region).getAllByText("OFL-1.1")).toHaveLength(2)
  })
})
