import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import en from "@/dictionaries/en/legal.json"
import { NOTICE_ACK_KEY, resetNoticeForTests } from "@/lib/legal/notice"
import { CookieNotice } from "./cookie-notice"

beforeEach(() => {
  window.localStorage.clear()
  resetNoticeForTests()
})

afterEach(() => vi.restoreAllMocks())

describe("CookieNotice", () => {
  it("renders nothing on the server, so the static page never contains it", () => {
    expect(renderToString(<CookieNotice lang="en" copy={en.cookieNotice} />)).toBe("")
  })

  it("appears for a first visit as a named region with links to both policies", () => {
    render(<CookieNotice lang="de" copy={en.cookieNotice} />)
    expect(screen.getByRole("region", { name: en.cookieNotice.label })).toHaveTextContent(en.cookieNotice.text)
    expect(screen.getByRole("link", { name: en.cookieNotice.cookies })).toHaveAttribute("href", "/de/cookies")
    expect(screen.getByRole("link", { name: en.cookieNotice.privacy })).toHaveAttribute("href", "/de/privacy")
  })

  it("stays gone after it was dismissed", () => {
    window.localStorage.setItem(NOTICE_ACK_KEY, "1")
    render(<CookieNotice lang="en" copy={en.cookieNotice} />)
    expect(screen.queryByRole("region", { name: en.cookieNotice.label })).toBeNull()
  })

  it("hides on 'Got it' and remembers it", async () => {
    render(<CookieNotice lang="en" copy={en.cookieNotice} />)
    await userEvent.click(screen.getByRole("button", { name: en.cookieNotice.dismiss }))
    expect(screen.queryByRole("region", { name: en.cookieNotice.label })).toBeNull()
    expect(window.localStorage.getItem(NOTICE_ACK_KEY)).toBe("1")
  })

  it("still hides for this page view when the browser blocks storage", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError")
    })
    render(<CookieNotice lang="en" copy={en.cookieNotice} />)
    await userEvent.click(screen.getByRole("button", { name: en.cookieNotice.dismiss }))
    expect(screen.queryByRole("region", { name: en.cookieNotice.label })).toBeNull()
  })

  it("sits bottom left, offers an optional offset and offers no 'reject' (nothing optional is set)", () => {
    render(<CookieNotice lang="en" copy={en.cookieNotice} className="md:left-[19rem]" />)
    const region = screen.getByRole("region", { name: en.cookieNotice.label })
    expect(region).toHaveClass("fixed", "z-40", "md:left-[19rem]")
    expect(region.className).toContain("bottom-")
    expect(screen.getAllByRole("button")).toHaveLength(1)
  })
})
