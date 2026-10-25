// @vitest-environment node
import { Children, type ReactElement, type ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { CookieNotice } from "@/components/cookie-notice/cookie-notice"
import { ThemeScript } from "@/components/theme/theme-script"
import en from "@/dictionaries/en/common.json"
import { SidebarScript } from "./_components/sidebar-script"
import DashboardRootLayout, { generateMetadata, generateStaticParams, viewport } from "./layout"

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as LayoutProps<"/[lang]">

describe("dashboard root layout", () => {
  it("titles pages after the app with its slogan, per language", async () => {
    expect(await generateMetadata(props("en"))).toEqual({
      metadataBase: new URL("https://www.firstmove.energy"),
      title: { default: en.app.name, template: `%s · ${en.app.name}` },
      description: en.app.slogan,
      // The dashboard is a client-side app whose data lives in the visitor's browser: noindex.
      robots: { index: false, follow: false },
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

  it("applies the stored theme and a collapsed sidebar in <head>, before paint (D-16, D-59)", async () => {
    const root = await DashboardRootLayout({ ...props("en"), children: null })
    const [head] = Children.toArray(root.props.children) as ReactElement<{ children: ReactNode }>[]
    expect(head.type).toBe("head")
    expect(Children.toArray(head.props.children).map((child) => (child as ReactElement).type)).toEqual([ThemeScript, SidebarScript])
  })

  it("keeps the cookie notice past the sidebar at its current width (D-59)", async () => {
    const root = await DashboardRootLayout({ ...props("en"), children: null })
    const [, body] = Children.toArray(root.props.children) as ReactElement<{ children: ReactNode }>[]
    const notice = Children.toArray(body.props.children).find((child) => (child as ReactElement).type === CookieNotice) as ReactElement<{ className: string }>
    expect(notice.props.className).toContain("var(--sidebar-width)")
  })
})
