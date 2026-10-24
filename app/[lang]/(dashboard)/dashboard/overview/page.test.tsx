// @vitest-environment node
import { describe, expect, it } from "vitest"
import overview from "@/dictionaries/en/overview.json"
import OverviewPage, { generateMetadata } from "./page"

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as PageProps<"/[lang]/dashboard/overview">

describe("overview page", () => {
  it("is titled from the overview dictionary (DE falls back to EN, D-32)", async () => {
    expect(await generateMetadata(props("en"))).toEqual({ title: overview.meta.title })
    expect(await generateMetadata(props("de"))).toEqual({ title: overview.meta.title })
  })

  it("loads the overview dictionary for the language and gates the view by an open project", async () => {
    const tree = await OverviewPage(props("de"))
    expect(tree.props.lang).toBe("de")
    expect(tree.props.dictionaries.overview.meta.title).toBe(overview.meta.title)
    const gate = tree.props.children
    expect(gate.props.module).toBeUndefined()
    expect(gate.props.children.type.name).toBe("OverviewView")
  })
})
