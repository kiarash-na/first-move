// @vitest-environment node
import type { ReactElement } from "react"
import { describe, expect, it } from "vitest"
import { JsonLd } from "./json-ld"

describe("JsonLd", () => {
  const element = JsonLd({ lang: "en", name: "First Move", slogan: "Start your 5GDHC Journey now", description: "The screening." }) as ReactElement<{
    type: string
    dangerouslySetInnerHTML: { __html: string }
  }>
  const data = JSON.parse(element.props.dangerouslySetInnerHTML.__html)

  it("describes First Move as a free web application in both languages", () => {
    expect(element.props.type).toBe("application/ld+json")
    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "First Move",
      alternateName: "Start your 5GDHC Journey now",
      url: "https://www.firstmove.energy/en",
      description: "The screening.",
      inLanguage: ["en", "de"],
      applicationCategory: "BusinessApplication",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: 0, priceCurrency: "EUR" },
    })
  })

  it("escapes markup so the script tag cannot break out", () => {
    const tricky = JsonLd({ lang: "de", name: "</script>", slogan: "s", description: "d" }) as typeof element
    expect(tricky.props.dangerouslySetInnerHTML.__html).not.toContain("</script>")
  })
})
