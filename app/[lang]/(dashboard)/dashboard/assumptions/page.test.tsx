// @vitest-environment node
import type { ReactElement } from "react"
import { describe, expect, it } from "vitest"
import assumptionsDe from "@/dictionaries/de/assumptions.json"
import shellDe from "@/dictionaries/de/shell.json"
import shell from "@/dictionaries/en/shell.json"
import { I18nProvider } from "../_components/i18n-provider"
import { ProjectGate } from "../_components/project-gate"
import { AssumptionsView } from "./_components/assumptions-view"
import AssumptionsPage, { generateMetadata } from "./page"

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as PageProps<"/[lang]/dashboard/assumptions">

type Element = ReactElement<Record<string, unknown> & { children: ReactElement<Record<string, unknown>> }>

describe("assumptions page", () => {
  it("loads its dictionary and gates the playground on the Quick Check", async () => {
    expect(await generateMetadata(props("en"))).toEqual({ title: shell.nav.items.assumptions })
    const tree = (await AssumptionsPage(props("de"))) as Element
    expect(tree.type).toBe(I18nProvider)
    expect(tree.props.lang).toBe("de")
    expect((tree.props.dictionaries as { assumptions: unknown }).assumptions).toMatchObject({ lead: assumptionsDe.lead })
    const [header, gate] = (tree.props.children as unknown as ReactElement<{ children: Element[] }>).props.children
    expect(header.props).toMatchObject({ title: shellDe.nav.items.assumptions, tone: "cool" })
    expect(gate.type).toBe(ProjectGate)
    expect(gate.props.module).toBe("quickCheck")
    expect(gate.props.children.type).toBe(AssumptionsView)
  })
})
