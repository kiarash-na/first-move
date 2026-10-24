// @vitest-environment node
import { describe, expect, it } from "vitest"
import { DocsSlugGuard } from "./docs-slug-guard"

const params = (slug?: string[]) => Promise.resolve({ lang: "en", slug }) as PageProps<"/[lang]/docs/[[...slug]]">["params"]

describe("DocsSlugGuard", () => {
  it("renders nothing for the docs index", async () => {
    expect(await DocsSlugGuard({ params: params() })).toBeNull()
    expect(await DocsSlugGuard({ params: params([]) })).toBeNull()
  })

  it("is a 404 for any slug", async () => {
    await expect(DocsSlugGuard({ params: params(["some", "slug"]) })).rejects.toThrow()
  })
})
