// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import { createTabSync, type ChannelLike, type TabMessage, type TabSync } from "./tab-sync"

const open: TabSync[] = []
const channelName = () => `test-${Math.random()}`

afterEach(() => {
  while (open.length) open.pop()!.close()
})

function tab(tabId: string, name: string, onMessage = vi.fn()) {
  const sync = createTabSync({ tabId, onMessage, channelName: name })
  open.push(sync)
  return { sync, onMessage }
}

const received = (onMessage: ReturnType<typeof vi.fn>) =>
  vi.waitFor(() => expect(onMessage).toHaveBeenCalled()).then(() => onMessage.mock.calls.map(([message]) => message as TabMessage))

describe("tab sync (BroadcastChannel)", () => {
  it("delivers saved and deleted messages to other tabs with the sender id", async () => {
    const name = channelName()
    const a = tab("a", name)
    const b = tab("b", name)
    a.sync.post({ type: "saved", projectId: "p", updatedAt: "2026-10-24T08:00:00.000Z" })
    a.sync.post({ type: "deleted", projectId: "q" })
    await vi.waitFor(() => expect(b.onMessage).toHaveBeenCalledTimes(2))
    expect(await received(b.onMessage)).toEqual([
      { type: "saved", tabId: "a", projectId: "p", updatedAt: "2026-10-24T08:00:00.000Z" },
      { type: "deleted", tabId: "a", projectId: "q" },
    ])
    expect(a.onMessage).not.toHaveBeenCalled()
  })

  it("drops invalid messages and its own id", async () => {
    const name = channelName()
    const b = tab("b", name)
    const raw = new BroadcastChannel(name)
    raw.postMessage({ type: "saved", tabId: "x" })
    raw.postMessage({ type: "unknown", tabId: "x", projectId: "p" })
    raw.postMessage({ type: "deleted", tabId: "b", projectId: "p" })
    raw.postMessage("text")
    raw.postMessage({ type: "deleted", tabId: "x", projectId: "last" })
    expect(await received(b.onMessage)).toEqual([{ type: "deleted", tabId: "x", projectId: "last" }])
    raw.close()
  })

  it("works without BroadcastChannel and after close", () => {
    const silent = createTabSync({ tabId: "a", onMessage: vi.fn(), createChannel: () => null })
    expect(() => silent.post({ type: "deleted", projectId: "p" })).not.toThrow()
    silent.close()

    const throwing = createTabSync({
      tabId: "a",
      onMessage: vi.fn(),
      createChannel: () => {
        throw new Error("no channel")
      },
    })
    expect(() => throwing.post({ type: "deleted", projectId: "p" })).not.toThrow()

    const channel: ChannelLike = {
      onmessage: null,
      postMessage: () => {
        throw new DOMException("closed", "InvalidStateError")
      },
      close: vi.fn(),
    }
    const closed = createTabSync({ tabId: "a", onMessage: vi.fn(), createChannel: () => channel })
    expect(() => closed.post({ type: "deleted", projectId: "p" })).not.toThrow()
    closed.close()
    closed.close()
    expect(channel.close).toHaveBeenCalledTimes(1)
  })
})
