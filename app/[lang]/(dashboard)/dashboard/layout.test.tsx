// @vitest-environment node
import { describe, expect, it } from "vitest"
import calcDe from "@/dictionaries/de/calc.json"
import shell from "@/dictionaries/de/shell.json"
import DashboardLayout from "./layout"

const props = (lang: string) => ({ params: Promise.resolve({ lang }), children: "page" }) as unknown as LayoutProps<"/[lang]/dashboard">

describe("dashboard layout", () => {
  it("hands the shared dictionary areas to the client shell", async () => {
    const tree = await DashboardLayout(props("de"))
    expect(tree.props.lang).toBe("de")
    expect(Object.keys(tree.props.dictionaries).sort()).toEqual(["business-plan", "calc", "common", "quick-check", "shell"])
    expect(tree.props.dictionaries.shell.nav.start).toBe("Alle Projekte")
    expect(tree.props.dictionaries.calc.ui.info).toBe(calcDe.ui.info)
    expect(tree.props.dictionaries.shell.nav.label).toBe(shell.nav.label)
    expect(tree.props.children.props.children).toBe("page")
  })

  it("rejects an unknown language", async () => {
    await expect(DashboardLayout(props("fr"))).rejects.toThrow()
  })
})
