import { z } from "zod"
import { TAB_CHANNEL } from "./keys"

/**
 * Messages between tabs (D-11). They carry ids and timestamps only: the receiving tab reads the
 * data from IndexedDB itself.
 */
const messageSchema = z.discriminatedUnion("type", [
  z.strictObject({ type: z.literal("saved"), tabId: z.string(), projectId: z.string(), updatedAt: z.string() }),
  z.strictObject({ type: z.literal("deleted"), tabId: z.string(), projectId: z.string() }),
])

export type TabMessage = z.infer<typeof messageSchema>

/** A message without the sender (added by `post`). */
export type OutgoingTabMessage = TabMessage extends infer M ? (M extends TabMessage ? Omit<M, "tabId"> : never) : never

/** The part of BroadcastChannel this module uses (injectable for tests). */
export interface ChannelLike {
  postMessage(message: unknown): void
  close(): void
  onmessage: ((event: MessageEvent) => void) | null
}

export interface TabSyncOptions {
  /** This tab's id; its own messages are ignored. */
  tabId: string
  onMessage(message: TabMessage): void
  /** Defaults to a BroadcastChannel; null when the browser has none (no sync, no error). */
  createChannel?: (name: string) => ChannelLike | null
  channelName?: string
}

export interface TabSync {
  post(message: OutgoingTabMessage): void
  close(): void
}

export function browserChannel(name: string): ChannelLike | null {
  return typeof BroadcastChannel === "function" ? new BroadcastChannel(name) : null
}

/** Joins the channel. Invalid or own messages are dropped. */
export function createTabSync({
  tabId,
  onMessage,
  createChannel = browserChannel,
  channelName = TAB_CHANNEL,
}: TabSyncOptions): TabSync {
  let channel: ChannelLike | null = null
  try {
    channel = createChannel(channelName)
  } catch {
    channel = null
  }
  if (channel) {
    channel.onmessage = (event) => {
      const parsed = messageSchema.safeParse(event.data)
      if (parsed.success && parsed.data.tabId !== tabId) onMessage(parsed.data)
    }
  }
  return {
    post(message) {
      try {
        channel?.postMessage({ ...message, tabId })
      } catch {
        // A closed channel: other tabs catch up on their next load.
      }
    },
    close() {
      if (!channel) return
      channel.onmessage = null
      channel.close()
      channel = null
    },
  }
}
