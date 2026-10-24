// @vitest-environment node
import { describe, expect, it } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { STEP_EXPLAIN } from "@/lib/quick-check"
import AssumptionsPage, { generateMetadata } from "./page"

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as PageProps<"/[lang]/dashboard/assumptions">

describe("assumptions page", () => {
  it("belongs to the Quick Check and explains the parameters", async () => {
    expect(await generateMetadata(props("en"))).toEqual({ title: shell.nav.items.assumptions })
    const tree = await AssumptionsPage(props("en"))
    expect(tree.props.module).toBe("quickCheck")
    expect(tree.props.children.props.explain).toBe(STEP_EXPLAIN.assumptions)
  })
})
