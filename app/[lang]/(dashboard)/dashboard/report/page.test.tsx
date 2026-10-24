// @vitest-environment node
import { describe, expect, it } from "vitest"
import report from "@/dictionaries/en/report.json"
import ReportPage, { generateMetadata } from "./page"

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as PageProps<"/[lang]/dashboard/report">

describe("report page (D-70)", () => {
  it("has a localized title", async () => {
    expect(await generateMetadata(props("en"))).toEqual({ title: report.meta.title })
  })

  it("hands the report and assumptions copy to the client view behind the project gate", async () => {
    const tree = await ReportPage(props("en"))
    expect(tree.props.lang).toBe("en")
    expect(tree.props.dictionaries.report.toolbar.print).toBe(report.toolbar.print)
    expect(tree.props.dictionaries.assumptions).toBeDefined()
    expect(tree.props.children.props.module).toBeUndefined()
  })
})
