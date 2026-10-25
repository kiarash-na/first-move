import { describe, expect, it } from "vitest"
import type { ToolExecutionOptions } from "ai"
import { assistantTools } from "./index"
import { exampleProject, testContext } from "../test-utils/context"

const options = (toolCallId = "call_1") => ({ toolCallId, messages: [] }) as unknown as ToolExecutionOptions<never>

type Executable = { execute: (input: unknown, options: ToolExecutionOptions<never>) => Promise<unknown> }
const exec = (tools: Record<string, unknown>, name: string, input: unknown, id?: string) => (tools[name] as Executable).execute(input, options(id))

describe("assistant tools", () => {
  it("offers three read-only tools and the proposal tool, nothing else", async () => {
    const { context } = await testContext()
    expect(Object.keys(assistantTools(context)).sort()).toEqual(["explain", "get_project", "propose_values", "search_docs"])
    const { context: none } = await testContext(null)
    expect(Object.keys(assistantTools(none)).sort()).toEqual(["explain", "get_project", "search_docs"])
  })

  it("get_project returns the open project as an untrusted block", async () => {
    const project = exampleProject()
    const { context } = await testContext(project)
    const result = String(await exec(assistantTools(context), "get_project", {}))
    expect(result.startsWith('<untrusted_document name="open-project">')).toBe(true)
    expect(result).toContain('"buildings.total"')
    expect(result).toContain(project.meta.name)
  })

  it("search_docs searches the public docs in the UI language", async () => {
    const { context, search } = await testContext(exampleProject("de"), "de")
    const result = (await exec(assistantTools(context), "search_docs", { query: "Ergebnis" })) as { results: { path: string }[] }
    expect(search).toHaveBeenCalledWith("de", "Ergebnis", 5)
    expect(result.results[0].path).toBe("/en/docs/quick-check#results")
  })

  it("explain gives the 'How we calculate' text with equation ids and names", async () => {
    type Calc = { results: { networkLengthM: { text: string; manual: string } } }
    type Explained = { text: string; formulas: { id: string; name: string }[] }
    const { context } = await testContext(null)
    const copy = (context.texts.calc as Calc).results.networkLengthM
    const estimated = (await exec(assistantTools(context), "explain", { topic: "result.networkLengthM" })) as Explained
    expect(estimated.text).toBe(copy.text)
    expect(estimated.formulas.map((formula) => formula.id)).toEqual(["EQ-3.3", "EQ-3.4a", "EQ-3.4b"])
    expect(estimated.formulas[0].name).not.toBe("EQ-3.3")
    const step = (await exec(assistantTools(context), "explain", { topic: "step.area" })) as Explained
    expect(step.text).toContain("building density")

    // The example enters its network length, so the estimate's equations drop out.
    const { context: entered } = await testContext(exampleProject())
    const manual = (await exec(assistantTools(entered), "explain", { topic: "result.networkLengthM" })) as Explained
    expect(manual.text).toBe(copy.manual)
    expect(manual.formulas).toEqual([])
  })

  it("propose_values builds a reviewed proposal and changes nothing", async () => {
    const project = exampleProject()
    const before = JSON.stringify(project)
    const { context, proposals } = await testContext(project)
    const result = (await exec(
      assistantTools(context),
      "propose_values",
      {
        values: [
          { field: "buildings.total", value: 60, quote: "We have 60 buildings" },
          { field: "buildings.areaM2", value: -5, unit: "m²", quote: "minus five" },
        ],
      },
      "call_7",
    )) as { status: string; valid: { key: string }[]; invalid: { key: string }[] }
    expect(result.status).toBe("shown-for-review")
    expect(result.valid.map((entry) => entry.key)).toEqual(["buildings.total"])
    expect(result.invalid.map((entry) => entry.key)).toEqual(["buildings.areaM2"])
    expect(proposals.get("call_7")?.patch).toEqual({ "buildings.total": 60 })
    expect(JSON.stringify(project)).toBe(before)
  })
})
