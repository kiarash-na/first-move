// @vitest-environment node
import { describe, expect, it } from "vitest"
import start from "@/dictionaries/en/start.json"
import DashboardPage, { generateMetadata } from "./page"

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as PageProps<"/[lang]/dashboard">

describe("start page", () => {
  it("has a localized title", async () => {
    expect(await generateMetadata(props("en"))).toEqual({ title: start.meta.title })
    expect(await generateMetadata(props("de"))).toEqual({ title: "Projekte" })
  })

  it("passes the start copy and the six example cards with their verdicts", async () => {
    const tree = await DashboardPage(props("de"))
    expect(tree.props.lang).toBe("de")
    expect(tree.props.dictionaries.start.paths.title).toBe(start.paths.title)
    const examples = tree.props.children.props.examples
    expect(examples).toHaveLength(6)
    expect(examples.every((card: { level: string | null }) => card.level !== null)).toBe(true)
  })
})
