import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import en from "@/dictionaries/en/presentation.json"
import { FeatureCards } from "./feature-cards"

const features = en.slides.nextMoves.features
const button = (title: string) => screen.getByRole("button", { name: new RegExp(title) })

describe("FeatureCards", () => {
  it("leads with the 3D scan, open, and its picture", () => {
    const { container } = render(<FeatureCards features={features} />)
    expect(features[0].id).toBe("scan")
    expect(button(features[0].title)).toHaveAttribute("aria-expanded", "true")
    expect(container.querySelector("[data-lead] .scan")).not.toBeNull()
    expect(container.querySelectorAll(".scan")).toHaveLength(1)
  })

  it("opens one card at a time and closes it again", async () => {
    render(<FeatureCards features={features} />)
    const map = button(features[1].title)
    await userEvent.click(map)
    expect(map).toHaveAttribute("aria-expanded", "true")
    expect(button(features[0].title)).toHaveAttribute("aria-expanded", "false")
    expect(document.getElementById(map.getAttribute("aria-controls") ?? "")).toHaveTextContent(features[1].text)
    await userEvent.click(map)
    expect(map).toHaveAttribute("aria-expanded", "false")
  })
})
