import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  NOTICE_ACK_KEY,
  acknowledgeNotice,
  loadNotice,
  noticeHidden,
  resetNoticeForTests,
  subscribeNotice,
  watchNoticeInOtherTabs,
} from "./notice"

beforeEach(() => {
  window.localStorage.clear()
  resetNoticeForTests()
})

afterEach(() => vi.restoreAllMocks())

describe("cookie notice state", () => {
  it("stays hidden until storage has been read", () => {
    expect(noticeHidden()).toBe(true)
  })

  it("shows for a first visit after loading", () => {
    loadNotice()
    expect(noticeHidden()).toBe(false)
  })

  it("stays hidden after the visitor dismissed it", () => {
    window.localStorage.setItem(NOTICE_ACK_KEY, "1")
    loadNotice()
    expect(noticeHidden()).toBe(true)
  })

  it("remembers a dismissal and tells subscribers", () => {
    loadNotice()
    const listener = vi.fn()
    subscribeNotice(listener)
    acknowledgeNotice()
    expect(noticeHidden()).toBe(true)
    expect(window.localStorage.getItem(NOTICE_ACK_KEY)).toBe("1")
    expect(listener).toHaveBeenCalled()
  })

  it("stays dismissed for this page view when storage refuses the write", () => {
    loadNotice()
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError")
    })
    acknowledgeNotice()
    expect(noticeHidden()).toBe(true)
  })

  it("shows the notice when storage cannot be read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError")
    })
    loadNotice()
    expect(noticeHidden()).toBe(false)
  })

  it("stops notifying after unsubscribing", () => {
    const listener = vi.fn()
    const unsubscribe = subscribeNotice(listener)
    unsubscribe()
    loadNotice()
    expect(listener).not.toHaveBeenCalled()
  })

  it("follows a dismissal made in another tab", () => {
    loadNotice()
    const stop = watchNoticeInOtherTabs()
    window.localStorage.setItem(NOTICE_ACK_KEY, "1")
    window.dispatchEvent(new StorageEvent("storage", { key: NOTICE_ACK_KEY, newValue: "1" }))
    expect(noticeHidden()).toBe(true)
    stop()
  })
})
