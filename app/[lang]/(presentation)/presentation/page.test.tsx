import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import de from "@/dictionaries/de/presentation.json"
import en from "@/dictionaries/en/presentation.json"
import { SLIDE_IDS } from "@/lib/presentation/slides"
import PresentationPage, { generateMetadata } from "./page"

vi.mock("next/navigation", () => ({ usePathname: () => "/en/presentation" }))

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as PageProps<"/[lang]/presentation">

describe("presentation page", () => {
  it("has its own title and description per language, with canonical, hreflang and cards", async () => {
    expect(await generateMetadata(props("de"))).toMatchObject({
      title: de.meta.title,
      description: de.meta.description,
      alternates: {
        canonical: "https://www.firstmove.energy/de/presentation",
        languages: {
          en: "https://www.firstmove.energy/en/presentation",
          de: "https://www.firstmove.energy/de/presentation",
          "x-default": "https://www.firstmove.energy/de/presentation",
        },
      },
      openGraph: { type: "website", siteName: "First Move", locale: "de_DE", alternateLocale: "en_US" },
      twitter: { card: "summary_large_image" },
    })
  })

  it("renders ten slides, no more, in the planned order", async () => {
    render(await PresentationPage(props("en")))
    const slides = screen.getAllByRole("region").filter((region) => region.getAttribute("aria-roledescription") === en.deck.slide)
    expect(SLIDE_IDS).toHaveLength(10)
    expect(slides.map((slide) => slide.dataset.slide)).toEqual([...SLIDE_IDS])
    expect(slides.map((slide) => slide.getAttribute("aria-label"))).toEqual(SLIDE_IDS.map((id, index) => `${index + 1} of 10: ${en.slides[id].title}`))
  })

  it("puts every slide's title on the page as a heading", async () => {
    render(await PresentationPage(props("de")))
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(10)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(de.deck.label)
  })
})
