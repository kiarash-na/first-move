import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axe from "axe-core"
import { afterEach, describe, expect, it, vi } from "vitest"

import { exampleProject } from "@/lib/assistant/agent/test-utils/context"
import { KEYS } from "@/lib/assistant/keys/registry"
import { scriptedFetch, sseResponse, textStream, toolCallStream } from "@/lib/assistant/openrouter/test-utils/sse"
import { getAt, parsePath } from "@/lib/project"
import { emptyProject } from "../../_components/test-utils/project-store"
import { agentStore, assistantCopy, renderAgent } from "../test-utils/render"
import { Chat } from "./chat"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/en/dashboard" }))

const copy = assistantCopy()
const KEY = `sk-or-v1-${"c4".repeat(32)}`
const MODEL = "openrouter/auto"

afterEach(() => {
  vi.unstubAllGlobals()
  KEYS.openrouter.clear()
})

function setup(responses: (() => Response)[]) {
  const project = exampleProject()
  const target = Number(getAt(project, parsePath("buildings.total")!)) + 7
  const store = agentStore(project)
  const scripted = scriptedFetch(responses)
  vi.stubGlobal("fetch", scripted.fetch)
  KEYS.openrouter.set(KEY)
  const view = renderAgent(<Chat provider="openrouter" modelId={MODEL} modelName="Auto Router" />, { store: store.store })
  return { ...store, scripted, target, unmount: view.unmount, field: screen.getByLabelText(copy.chat.label) }
}

/** A provider answer that waits until `release` is called, or fails once the request is aborted. */
function heldResponse() {
  let release: (response: Response) => void = () => {}
  let signal: AbortSignal | undefined
  const fetch = vi.fn(
    (_input: RequestInfo | URL, init: RequestInit = {}) =>
      new Promise<Response>((resolve, reject) => {
        signal = init.signal ?? undefined
        signal?.addEventListener("abort", () => reject(signal!.reason))
        release = resolve
      }),
  )
  return { fetch, release: (response: Response) => release(response), signal: () => signal }
}

describe("Chat", () => {
  it("runs a turn in the browser with the user's key, shows the review card, and applies exactly the confirmed patch with AI provenance", async () => {
    const target = Number(getAt(exampleProject(), parsePath("buildings.total")!)) + 7
    const { scripted, field, applyProposal, current } = setup([
      () => toolCallStream("propose_values", { values: [{ field: "buildings.total", value: target, quote: `We now have ${target} buildings` }] }),
      () => textStream(`I prepared **${target} buildings** for your review.`),
      () => textStream("Noted."),
    ])
    await userEvent.type(field, `We now have ${target} buildings{Enter}`)

    const card = await screen.findByRole("region", { name: copy.review.title })
    await waitFor(() => expect(screen.getByText(`${target} buildings`).tagName).toBe("STRONG"))
    expect(within(card).getByText(String(target))).toBeInTheDocument()

    // Straight to OpenRouter, with the key, data collection denied, and the four tools.
    expect(scripted.calls).toHaveLength(2)
    const [first, second] = scripted.calls
    expect(first.url).toBe("https://openrouter.ai/api/v1/chat/completions")
    expect(new Headers(first.init.headers).get("authorization")).toBe(`Bearer ${KEY}`)
    expect(first.body).toMatchObject({ model: MODEL, provider: { data_collection: "deny" }, stream: true })
    expect((first.body!.tools as { function: { name: string } }[]).map((tool) => tool.function.name).sort()).toEqual(["explain", "get_project", "propose_values", "search_docs"])
    expect(JSON.stringify(second.body)).toContain("shown-for-review")

    // Nothing changed before the user applies.
    expect(applyProposal).not.toHaveBeenCalled()
    expect(getAt(current(), parsePath("buildings.total")!)).toBe(target - 7)

    await userEvent.click(within(card).getByRole("button", { name: copy.review.apply }))
    expect(applyProposal).toHaveBeenCalledExactlyOnceWith({ "buildings.total": target }, { by: "assistant", model: MODEL })
    expect(getAt(current(), parsePath("buildings.total")!)).toBe(target)
    expect(current().provenance.ai["buildings.total"]).toMatchObject({ by: "assistant", model: MODEL })
    expect(within(card).getByRole("status")).toHaveTextContent("Applied: 1.")
    expect(within(card).queryByRole("button", { name: copy.review.apply })).not.toBeInTheDocument()

    // The next message tells the model what the user did with the card, with the history.
    await userEvent.type(field, "Thanks{Enter}")
    expect(await screen.findByText("Noted.")).toBeInTheDocument()
    const third = JSON.stringify(scripted.calls[2].body)
    expect(third).toContain("Review card: the user applied buildings.total.")
    expect(third).toContain(`We now have ${target} buildings`)
  })

  it("keeps the messages a list inside a log that is there before the first answer (axe)", async () => {
    const target = Number(getAt(exampleProject(), parsePath("buildings.total")!)) + 7
    const { field } = setup([
      () => toolCallStream("propose_values", { values: [{ field: "buildings.total", value: target, quote: "x" }] }),
      () => textStream("Prepared."),
    ])
    const log = screen.getByRole("log", { name: copy.panel.title })
    expect(log.textContent).toBe("")
    await userEvent.type(field, "Propose{Enter}")
    await screen.findByRole("region", { name: copy.review.title })
    await screen.findByText("Prepared.")
    expect(screen.getByRole("log", { name: copy.panel.title })).toBe(log)
    expect(within(log).getAllByRole("list")[0].tagName).toBe("UL")
    // Structure rules only: jsdom has no layout, so contrast and the like are the e2e spec's.
    const rules = ["list", "listitem", "aria-allowed-role", "aria-required-children", "aria-required-parent", "heading-order"]
    const { violations } = await axe.run(document.body, { runOnly: { type: "rule", values: rules } })
    expect(violations.map((violation) => violation.id)).toEqual([])
  })

  it("starts a new conversation without the old history", async () => {
    const { field, scripted } = setup([() => textStream("First answer."), () => textStream("Second answer.")])
    await userEvent.type(field, "Remember the word heliotrope{Enter}")
    await screen.findByText("First answer.")
    await userEvent.click(screen.getByRole("button", { name: copy.chat.clear }))
    expect(screen.queryByText("First answer.")).not.toBeInTheDocument()
    await userEvent.type(field, "Which word?{Enter}")
    await screen.findByText("Second answer.")
    expect(JSON.stringify(scripted.calls[1].body)).not.toContain("heliotrope")
  })

  it("marks every answer as AI-generated and lists the tools it used", async () => {
    const { field } = setup([() => toolCallStream("get_project", {}), () => textStream("Your project has 3 empty required fields.")])
    await userEvent.type(field, "What is missing?{Enter}")
    const answer = await screen.findByText("Your project has 3 empty required fields.")
    const item = answer.closest("li[data-role='assistant']")!
    expect(item).toHaveAttribute("data-ai-generated", "true")
    expect(within(item as HTMLElement).getByText(copy.chat.aiLabel)).toBeInTheDocument()
    expect(within(item as HTMLElement).getByText(copy.chat.tools.get_project)).toBeInTheDocument()
    expect(screen.getByText("What is missing?").closest("li")).toHaveAttribute("data-role", "user")
  })

  it("dismisses a proposal without changing anything", async () => {
    const target = Number(getAt(exampleProject(), parsePath("buildings.total")!)) + 7
    const { field, applyProposal } = setup([
      () => toolCallStream("propose_values", { values: [{ field: "buildings.total", value: target, quote: "x" }] }),
      () => textStream("Prepared."),
      () => textStream("Understood."),
    ])
    await userEvent.type(field, "Propose{Enter}")
    const card = await screen.findByRole("region", { name: copy.review.title })
    await userEvent.click(within(card).getByRole("button", { name: copy.review.dismiss }))
    expect(within(card).getByRole("status")).toHaveTextContent(copy.review.dismissed)
    expect(applyProposal).not.toHaveBeenCalled()
  })

  it("explains a provider error in plain words and tries again", async () => {
    const { field, scripted } = setup([
      () => new Response(JSON.stringify({ error: { code: 402, message: "Insufficient credits" } }), { status: 402, headers: { "content-type": "application/json" } }),
      () => textStream("Here is the answer."),
    ])
    await userEvent.type(field, "Hello{Enter}")
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent(copy.errors.credits)
    expect(alert).not.toHaveTextContent("Insufficient credits")
    await userEvent.click(within(alert).getByRole("button", { name: copy.chat.retry }))
    expect(await screen.findByText("Here is the answer.")).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.getAllByText("Hello")).toHaveLength(1)
    expect(scripted.calls).toHaveLength(2)
  })

  it("maps an error OpenRouter reports inside the stream", async () => {
    const { field } = setup([() => sseResponse([`data: ${JSON.stringify({ error: { code: 429, message: "Rate limit exceeded" } })}\n\n`])])
    await userEvent.type(field, "Hello{Enter}")
    expect(await screen.findByRole("alert")).toHaveTextContent(copy.errors.rate)
  })

  it("stops a running turn when the chat closes, as when another project opens", async () => {
    const { field, unmount } = setup([])
    const held = heldResponse()
    vi.stubGlobal("fetch", held.fetch)
    await userEvent.type(field, "Hello{Enter}")
    await waitFor(() => expect(held.signal()).toBeDefined())
    expect(held.signal()!.aborted).toBe(false)
    unmount()
    expect(held.signal()!.aborted).toBe(true)
  })

  it("never lets a turn read a project opened after it started", async () => {
    const { field, set } = setup([])
    const other = { ...emptyProject(), meta: { ...emptyProject().meta, name: "Project opened later" } }
    const bodies: string[] = []
    let first: ReturnType<typeof heldResponse> | null = heldResponse()
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
        bodies.push(String(init.body))
        if (first) return first.fetch(input, init)
        return textStream("Done.")
      }),
    )
    await userEvent.type(field, "What is in my project?{Enter}")
    await waitFor(() => expect(bodies).toHaveLength(1))
    set({ active: other, activeId: other.meta.id })
    const held = first
    first = null
    held.release(toolCallStream("get_project", {}))
    expect(await screen.findByText("Done.")).toBeInTheDocument()
    expect(bodies[1]).toContain("No project is open.")
    expect(bodies[1]).not.toContain("Project opened later")
  })

  it("sends nothing without a key", async () => {
    const { field, scripted } = setup([])
    KEYS.openrouter.clear()
    await userEvent.type(field, "Hello{Enter}")
    expect(await screen.findByRole("alert")).toHaveTextContent(copy.errors.key)
    expect(scripted.calls).toHaveLength(0)
  })
})
