// @vitest-environment node
import { describe, expect, it } from "vitest"
import en from "@/dictionaries/en/common.json"
import DashboardRootLayout, { generateMetadata, generateStaticParams, viewport } from "./layout"

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as LayoutProps<"/[lang]">

describe("dashboard root layout", () => {
  it("titles pages after the app with its slogan, per language", async () => {
    expect(await generateMetadata(props("en"))).toEqual({
      title: { default: en.app.name, template: `%s · ${en.app.name}` },
      description: en.app.slogan,
    })
    // DE falls back to EN where it has no copy (D-32).
    expect((await generateMetadata(props("de"))).description).toBeTruthy()
  })

  it("prerenders both locales and fits the device width", () => {
    expect(generateStaticParams()).toEqual([{ lang: "en" }, { lang: "de" }])
    expect(viewport).toMatchObject({ width: "device-width", initialScale: 1 })
  })

  it("renders a dark html root in the page language (D-16)", async () => {
    const root = await DashboardRootLayout({ ...props("de"), children: null })
    expect(root.type).toBe("html")
    expect(root.props).toMatchObject({ lang: "de", "data-theme": "dark", suppressHydrationWarning: true })
  })
})
