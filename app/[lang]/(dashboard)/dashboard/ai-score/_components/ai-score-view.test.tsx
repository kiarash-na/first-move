import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mockText } from "@/lib/ai/plan-score/test-utils/mock-text"
import { clearGatewayKey, readGatewayKey } from "@/lib/assistant/gateway/key"
import { DEFAULT_TEXT_MODEL } from "@/lib/assistant/gateway/models"
import { openRouterKey } from "@/lib/assistant/openrouter/key"
import { aiScoreSchema } from "@/lib/project"
import { AiScoreView } from "./ai-score-view"
import { setAcknowledged } from "./setup/acknowledgement"
import { fakeClient, REPORT, type FakeClientOptions } from "./test-utils/fake-client"
import { aiScoreCopy, aiScoreStore, renderAiScore } from "./test-utils/render"
import { example, scored } from "./test-utils/scored"

const KEY = "vck_test_0123456789abcdefWXYZ"
const copy = aiScoreCopy()

/** A full run takes longer than waitFor's default second under full-suite load. */
const slow = { timeout: 5_000 }

/** Two transitions plus user-event typing can outgrow the 5 s test budget under load. */
const slowTest = 15_000

afterEach(() => {
  clearGatewayKey()
  openRouterKey.clear()
  setAcknowledged(false)
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/** Stubs the key-check endpoints; `creditsStatus` fails the Gateway's balance check. */
function stubChecks(creditsStatus?: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes("ai-gateway.vercel.sh/v1/credits")) {
        if (creditsStatus) return new Response("nope", { status: creditsStatus })
        return Response.json({ balance: "4.2", total_used: "0.8" })
      }
      if (url.includes("openrouter.ai/api/v1/key")) return Response.json({ data: { limit: 5, limit_remaining: 3.2, limit_reset: null, usage: 1.8, expires_at: "2027-01-04T00:00:00.000Z" } })
      return new Response("not found", { status: 404 })
    }),
  )
}

function show(options: FakeClientOptions = {}, project = example(), creditsStatus?: number) {
  stubChecks(creditsStatus)
  const store = aiScoreStore(project)
  const fake = fakeClient(options)
  renderAiScore(<AiScoreView createClient={fake.create} />, { store: store.store })
  return { store, fake }
}

/** Connects a Gateway key: the page starts on OpenRouter, so the provider is switched first. */
async function connect() {
  await userEvent.click(screen.getByRole("radio", { name: new RegExp(copy.setup.providers.gateway) }))
  await userEvent.click(screen.getByRole("checkbox", { name: copy.setup.notice.ack }))
  await userEvent.type(screen.getByLabelText(copy.setup.key.label.gateway), KEY)
  await userEvent.click(screen.getByRole("button", { name: copy.setup.key.use }))
  await userEvent.click(screen.getByRole("checkbox", { name: copy.setup.data.ack }))
}

const startButton = () => screen.getByRole("button", { name: copy.run.start })

describe("AiScoreView (D-71)", () => {
  it("introduces a separate AI scoring and waits for a key, OpenRouter by default", () => {
    show()
    expect(screen.getByRole("heading", { level: 1, name: copy.title })).toBeInTheDocument()
    expect(screen.getByText(copy.intro.badge)).toBeInTheDocument()
    expect(screen.getByRole("complementary", { name: copy.intro.title })).toHaveTextContent(copy.intro.points.calculation)
    expect(screen.getByRole("radio", { name: new RegExp(copy.setup.providers.openrouter) })).toBeChecked()
    expect(screen.getByLabelText(copy.setup.key.label.openrouter)).toHaveAttribute("type", "password")
    expect(startButton()).toBeDisabled()
    expect(screen.getByText(copy.run.needs.key)).toBeInTheDocument()
    expect(document.querySelector("[data-slot='decision-flow']")).toHaveAttribute("data-mode", "idle")
    expect(document.querySelector("[data-slot='ai-score-results']")).toBeNull()
  })

  it("runs once a key is set and what is sent is confirmed, then saves and shows the result", async () => {
    const { store, fake } = show()
    await connect()
    expect(await screen.findByText("Key accepted. Balance: $4.20")).toBeInTheDocument()
    expect(startButton()).toBeEnabled()
    await userEvent.click(startButton())
    expect(await screen.findByText(copy.run.done)).toBeInTheDocument()
    expect(fake.create).toHaveBeenCalledWith("gateway", KEY)
    expect(fake.textModel).toHaveBeenCalledWith(DEFAULT_TEXT_MODEL)
    const saved = aiScoreSchema.parse(store.current().aiScore)
    expect(saved.report?.headline).toBe(REPORT.headline)
    expect(document.querySelector("[data-slot='decision-flow']")).toHaveAttribute("data-mode", "saved")
    expect(document.querySelector("[data-slot='ai-score-results']")).toHaveAttribute("data-score", String(saved.score))
    expect(screen.getByRole("button", { name: copy.run.again })).toBeEnabled()
  })

  it("runs on an OpenRouter key as well, with the Auto Router as the default text model", async () => {
    const orKey = `sk-or-v1-${"ab".repeat(32)}`
    const { store, fake } = show()
    await userEvent.click(screen.getByRole("checkbox", { name: copy.setup.notice.ack }))
    await userEvent.type(screen.getByLabelText(copy.setup.key.label.openrouter), orKey)
    await userEvent.click(screen.getByRole("button", { name: copy.setup.key.use }))
    expect(await screen.findByText(copy.setup.credits.accepted)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("checkbox", { name: copy.setup.data.ack }))
    expect(startButton()).toBeEnabled()
    await userEvent.click(startButton())
    expect(await screen.findByText(copy.run.done)).toBeInTheDocument()
    expect(fake.create).toHaveBeenCalledWith("openrouter", orKey)
    expect(fake.textModel).toHaveBeenCalledWith("openrouter/auto")
    expect(aiScoreSchema.parse(store.current().aiScore).report?.headline).toBe(REPORT.headline)
  })

  it("shows the progress per turn while running, and cancels", async () => {
    const { store } = show({ hold: true })
    await connect()
    await userEvent.click(startButton())
    const progress = await screen.findByRole("list", { name: copy.run.progress.label })
    await waitFor(() => expect(within(progress).getAllByRole("listitem")[1]).toHaveAttribute("data-state", "running"))
    expect(document.querySelector("[data-column='1']")).toHaveAttribute("data-state", "running")
    expect(document.querySelector("[data-column='0'] [data-flow-node='signal:quick-check']")).not.toBeNull()
    await userEvent.click(screen.getByRole("button", { name: copy.run.cancel }))
    expect(await screen.findByRole("alert")).toHaveTextContent(copy.errors.aborted)
    expect(store.setAiScore).not.toHaveBeenCalled()
  })

  it("explains a provider error in plain words", async () => {
    const { fake } = show()
    fake.jev.model.doDecide = async () => {
      throw Object.assign(new Error("402"), { statusCode: 402 })
    }
    await connect()
    await userEvent.click(startButton())
    expect(await screen.findByRole("alert")).toHaveTextContent(copy.errors.credits)
  })

  it("shows a balance check error without losing the key", async () => {
    show({}, example(), 429)
    await connect()
    expect(await screen.findByText(/The key is kept, but it could not be checked/)).toHaveTextContent(copy.errors.rate)
    expect(readGatewayKey()).toBe(KEY)
    expect(startButton()).toBeEnabled()
  })

  it("keeps the score when the report fails and writes it again on request", async () => {
    const { store, fake } = show({ textStatus: 503 })
    await connect()
    await userEvent.click(startButton())
    expect(await screen.findByRole("alert")).toHaveTextContent(`The score is saved, but the report could not be written. ${copy.errors.provider}`)
    expect(store.current().aiScore?.report).toBeNull()
    fake.textModel.mockImplementation(() => mockText(REPORT))
    await userEvent.click(screen.getByRole("button", { name: copy.run.writeAgain }))
    await waitFor(() => expect(store.current().aiScore?.report?.headline).toBe(REPORT.headline))
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("shows why the report of the latest run failed, not an older error", async () => {
    const { fake } = show({ textStatus: 503 })
    const fail = (status: number) => () => {
      throw Object.assign(new Error(`status ${status}`), { statusCode: status })
    }
    await connect()
    await userEvent.click(startButton())
    const panel = within(document.getElementById("ai-score-run")!)
    expect(await panel.findByRole("alert")).toHaveTextContent(copy.errors.provider)
    // A full run precedes the second report; under load it takes longer than waitFor's default second.
    fake.textModel.mockImplementation(fail(429))
    await userEvent.click(panel.getByRole("button", { name: copy.run.writeAgain }))
    await waitFor(() => expect(panel.getByRole("alert")).toHaveTextContent(copy.errors.rate), slow)
    fake.textModel.mockImplementation(fail(503))
    await userEvent.click(panel.getByRole("button", { name: copy.run.again }))
    await waitFor(() => expect(panel.getByRole("alert")).toHaveTextContent(copy.errors.provider), slow)
    expect(panel.getByRole("alert")).not.toHaveTextContent(copy.errors.rate)
  })

  it("says a run is in progress, not that a key is missing, while the saved result waits for it", async () => {
    const project = example()
    const { fake } = show({ hold: true }, { ...project, aiScore: await scored(project) })
    await connect()
    expect(screen.queryByText(copy.results.needsAi)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: copy.run.again }))
    await waitFor(() => expect(document.querySelector("[data-column='1']")).toHaveAttribute("data-state", "running"), slow)
    const report = document.querySelector<HTMLElement>("[data-slot='report-panel']")!
    expect(within(report).getByRole("button")).toBeDisabled()
    expect(within(report).getByText(copy.results.runInProgress)).toBeInTheDocument()
    expect(screen.queryByText(copy.results.needsAi)).not.toBeInTheDocument()
    fake.release()
    expect(await screen.findByText(copy.run.done, undefined, slow)).toBeInTheDocument()
    expect(screen.queryByText(copy.results.runInProgress)).not.toBeInTheDocument()
  }, slowTest)

  it("stops a run in flight when the saved score is deleted, so it does not come back", async () => {
    const project = example()
    const { store, fake } = show({ hold: true }, { ...project, aiScore: await scored(project) })
    await connect()
    await userEvent.click(screen.getByRole("button", { name: copy.run.again }))
    await waitFor(() => expect(document.querySelector("[data-column='1']")).toHaveAttribute("data-state", "running"), slow)
    await userEvent.click(screen.getByRole("button", { name: copy.results.remove.action }))
    await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: copy.results.remove.confirm }))
    fake.release()
    expect(await within(document.getElementById("ai-score-run")!).findByRole("alert", undefined, slow)).toHaveTextContent(copy.errors.aborted)
    expect(store.setAiScore).toHaveBeenCalledTimes(1)
    expect(store.setAiScore).toHaveBeenCalledWith(project.meta.id, null)
    expect(store.current().aiScore).toBeNull()
  }, slowTest)

  it("shows a saved result from the project, with its flow", async () => {
    const project = example()
    const score = await scored(project)
    show({}, { ...project, aiScore: score })
    expect(document.querySelector("[data-slot='ai-score-results']")).toHaveAttribute("data-score", String(score.score))
    expect(document.querySelector("[data-slot='decision-flow']")).toHaveAttribute("data-mode", "saved")
    expect(screen.getByRole("button", { name: copy.run.again })).toBeDisabled()
    expect(screen.getByText(copy.run.againNote)).toBeInTheDocument()
  })

  it("never writes the key to storage or the URL", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem")
    const pushState = vi.spyOn(window.history, "pushState")
    const replaceState = vi.spyOn(window.history, "replaceState")
    const { store } = show()
    await connect()
    await userEvent.click(startButton())
    await screen.findByText(copy.run.done)
    expect(setItem).not.toHaveBeenCalled()
    expect(pushState).not.toHaveBeenCalled()
    expect(replaceState).not.toHaveBeenCalled()
    expect(window.location.href).not.toContain(KEY)
    expect(document.body.innerHTML).not.toContain(KEY)
    expect(JSON.stringify(store.current())).not.toContain(KEY)
  })
})
