// @vitest-environment node
import { describe, expect, it } from "vitest"
import { CookieNotice } from "@/components/cookie-notice/cookie-notice"
import common from "@/dictionaries/de/common.json"
import PresentationLayout, { generateMetadata, generateStaticParams } from "./layout"

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as LayoutProps<"/[lang]">

describe("presentation layout", () => {
  it("prerenders both locales", () => {
    expect(generateStaticParams()).toEqual([{ lang: "en" }, { lang: "de" }])
  })

  it("names pages after First Move", async () => {
    expect(await generateMetadata(props("de"))).toEqual({
      title: { default: common.app.name, template: `%s · ${common.app.name}` },
      description: common.app.slogan,
    })
  })

  it("renders a dark html root in the page language with the boot script in the head", async () => {
    const root = await PresentationLayout({ ...props("de"), children: null })
    expect(root.type).toBe("html")
    expect(root.props).toMatchObject({ lang: "de", "data-theme": "dark" })
    const [head] = root.props.children
    expect(head.type).toBe("head")
  })

  it("lifts the cookie notice above the deck's bottom bar", async () => {
    const root = await PresentationLayout({ ...props("en"), children: null })
    const [, body] = root.props.children
    const notice = [body.props.children].flat().find((child: { type?: unknown }) => child?.type === CookieNotice)
    expect(notice.props.className).toMatch(/^bottom-\[calc\(.+_\+_\d+px\)\]$/)
  })
})
