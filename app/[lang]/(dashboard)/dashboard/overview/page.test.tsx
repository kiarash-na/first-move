// @vitest-environment node
import { describe, expect, it } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import OverviewPage, { generateMetadata } from "./page"

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as PageProps<"/[lang]/dashboard/overview">

describe("overview page", () => {
  it("is titled and gated by an open project", async () => {
    expect(await generateMetadata(props("en"))).toEqual({ title: shell.nav.items.overview })
    const tree = await OverviewPage(props("de"))
    expect(tree.props.module).toBeUndefined()
    expect(tree.props.children.props.title).toBe("Übersicht")
  })
})
