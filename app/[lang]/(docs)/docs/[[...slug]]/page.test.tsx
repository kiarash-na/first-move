// @vitest-environment node
import type { ReactElement } from "react"
import { Suspense } from "react"
import { describe, expect, it, vi } from "vitest"
import de from "@/dictionaries/de/common.json"
import { ComingSoon } from "../../_components/coming-soon"
import { DocsSlugGuard } from "./_components/docs-slug-guard"
import DocsPage, { ensureStatic, generateStaticParams } from "./page"

vi.mock("next/root-params", () => ({ lang: async () => "de" }))

const props = { params: Promise.resolve({ lang: "de", slug: undefined }) } as PageProps<"/[lang]/docs/[[...slug]]">

type Tree = ReactElement<{ children: ReactElement<Record<string, unknown>>[] }>

describe("docs page", () => {
  it("prerenders only the index and waits for the complete page", () => {
    expect(generateStaticParams()).toEqual([{ slug: [] }])
    expect(ensureStatic).toBe("navigation")
  })

  it("renders the coming-soon page in the root language and checks the slug inside Suspense", async () => {
    const tree = (await DocsPage(props)) as Tree
    const [page, boundary] = tree.props.children
    expect(page.type).toBe(ComingSoon)
    expect(page.props).toMatchObject({ lang: "de", copy: { eyebrow: de.docs.eyebrow } })
    expect(boundary.type).toBe(Suspense)
    const guard = boundary.props.children as ReactElement<{ params: unknown }>
    expect(guard.type).toBe(DocsSlugGuard)
    expect(guard.props.params).toBe(props.params)
  })
})
