import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mockText } from "@/lib/ai/plan-score/test-utils/mock-text"
import { clearGatewayKey, readGatewayKey } from "@/lib/assistant/gateway/key"
import { DEFAULT_TEXT_MODEL } from "@/lib/assistant/gateway/models"
import { aiScoreSchema } from "@/lib/project"
import { AiScoreView } from "./ai-score-view"
import { setAcknowledged } from "./setup/acknowledgement"
import { fakeClient, REPORT, type FakeClientOptions } from "./test-utils/fake-client"
import { aiScoreCopy, aiScoreStore, renderAiScore } from "./test-utils/render"
import { example, scored } from "./test-utils/scored"

const KEY = "vck_test_0123456789abcdefWXYZ"
const copy = aiScoreCopy()

afterEach(() => {
  clearGatewayKey()
  setAcknowledged(false)
  vi.restoreAllMocks()
})

function show(options: FakeClientOptions = {}, project = example()) {
  const store = aiScoreStore(project)
  const fake = fakeClient(options)
  renderAiScore(<AiScoreView createClient={fake.create} />, { store: store.store })
  return { store, fake }
}

async function connect() {
  await userEvent.type(screen.getByLabelText(copy.setup.key.label), KEY)
  await userEvent.click(screen.getByRole("button", { name: copy.setup.key.use }))
  await userEvent.click(screen.getByRole("checkbox", { name: copy.setup.data.ack }))
}

const startButton = () => screen.getByRole("button", { name: copy.run.start })

describe("AiScoreView (D-71)", () => {
  it("introduces a separate AI scoring and waits for a key", () => {
    show()
    expect(screen.getByRole("heading", { level: 1, name: copy.title })).toBeInTheDocument()
    expect(screen.getByText(copy.intro.badge)).toBeInTheDocument()
    expect(screen.getByRole("complementary", { name: copy.intro.title })).toHaveTextContent(copy.intro.points.calculation)
    expect(screen.getByLabelText(copy.setup.key.label)).toHaveAttribute("type", "password")
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
    expect(fake.create).toHaveBeenCalledWith(KEY)
    expect(fake.textModel).toHaveBeenCalledWith(DEFAULT_TEXT_MODEL)
    const saved = aiScoreSchema.parse(store.current().aiScore)
    expect(saved.report?.headline).toBe(REPORT.headline)
    expect(document.querySelector("[data-slot='decision-flow']")).toHaveAttribute("data-mode", "saved")
    expect(document.querySelector("[data-slot='ai-score-results']")).toHaveAttribute("data-score", String(saved.score))
    expect(screen.getByRole("button", { name: copy.run.again })).toBeEnabled()
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

  it("explains a Gateway error in plain words", async () => {
    const { fake } = show()
    fake.jev.model.doDecide = async () => {
      throw Object.assign(new Error("402"), { statusCode: 402 })
    }
    await connect()
    await userEvent.click(startButton())
    expect(await screen.findByRole("alert")).toHaveTextContent(copy.errors.credits)
  })

  it("shows a balance check error without losing the key", async () => {
    show({ creditsStatus: 429 })
    await connect()
    expect(await screen.findByText(/The key is kept, but the balance could not be checked/)).toHaveTextContent(copy.errors.rate)
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
