// @vitest-environment node
import { describe, expect, it, vi } from "vitest"
import { createAutosave, type AutosaveState } from "./autosave"
import { manualTimers } from "./test-utils/manual-timers"

function setup({ ok = true } = {}) {
  const timers = manualTimers()
  const saved: number[] = []
  const states: AutosaveState[] = []
  let resolveWrite: ((ok: boolean) => void) | null = null
  let hold = false
  const save = vi.fn(async (value: number) => {
    if (hold) {
      const result = await new Promise<boolean>((resolve) => (resolveWrite = resolve))
      if (result) saved.push(value)
      return result
    }
    if (ok) saved.push(value)
    return ok
  })
  const saveSync = vi.fn(() => true)
  const autosave = createAutosave<number>({ delayMs: 400, retryMs: 5000, timers, save, saveSync, onChange: (state) => states.push(state) })
  return {
    autosave,
    timers,
    saved,
    states,
    save,
    saveSync,
    hold: () => (hold = true),
    release: (result = true) => {
      hold = false
      resolveWrite?.(result)
    },
  }
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

describe("autosave", () => {
  it("saves 400 ms after the last change, once, with the newest value", async () => {
    const { autosave, timers, saved, save, states } = setup()
    autosave.schedule(1)
    timers.advance(300)
    autosave.schedule(2)
    timers.advance(399)
    expect(save).not.toHaveBeenCalled()
    expect(autosave.pending()).toBe(true)
    expect(autosave.state).toBe("pending")
    timers.advance(1)
    await settle()
    expect(saved).toEqual([2])
    expect(autosave.pending()).toBe(false)
    expect(states).toEqual(["pending", "saving", "idle"])
  })

  it("writes one value at a time and follows up with changes made meanwhile", async () => {
    const { autosave, timers, saved, save, hold, release } = setup()
    hold()
    autosave.schedule(1)
    timers.advance(400)
    autosave.schedule(2)
    timers.advance(400)
    expect(save).toHaveBeenCalledTimes(1)
    expect(autosave.state).toBe("saving")
    release()
    await settle()
    expect(autosave.state).toBe("pending")
    timers.advance(400)
    await settle()
    expect(saved).toEqual([1, 2])
    expect(autosave.state).toBe("idle")
  })

  it("flush saves now and waits; true when stored", async () => {
    const { autosave, saved } = setup()
    expect(await autosave.flush()).toBe(true)
    autosave.schedule(7)
    expect(await autosave.flush()).toBe(true)
    expect(saved).toEqual([7])
  })

  it("retries a failed save and reports the error", async () => {
    const harness = setup({ ok: false })
    const { autosave, timers, save } = harness
    autosave.schedule(1)
    expect(await autosave.flush()).toBe(false)
    expect(autosave.state).toBe("error")
    expect(autosave.pending()).toBe(true)
    timers.advance(5000)
    await settle()
    expect(save).toHaveBeenCalledTimes(2)
  })

  it("treats a throwing save as failed", async () => {
    const timers = manualTimers()
    const autosave = createAutosave<number>({
      delayMs: 400,
      retryMs: 5000,
      timers,
      save: async () => {
        throw new Error("boom")
      },
      saveSync: () => true,
    })
    autosave.schedule(1)
    expect(await autosave.flush()).toBe(false)
  })

  it("flushSync copies the newest value at once and starts the write", async () => {
    const { autosave, saveSync, saved } = setup()
    expect(autosave.flushSync()).toBe(true)
    expect(saveSync).not.toHaveBeenCalled()
    autosave.schedule(3)
    expect(autosave.flushSync()).toBe(true)
    expect(saveSync).toHaveBeenCalledWith(3)
    await settle()
    expect(saved).toEqual([3])
  })

  it("flushSync reports false when the synchronous copy fails", () => {
    const timers = manualTimers()
    const autosave = createAutosave<number>({ delayMs: 400, retryMs: 5000, timers, save: () => new Promise(() => undefined), saveSync: () => false })
    autosave.schedule(1)
    expect(autosave.flushSync()).toBe(false)
    expect(autosave.latest()).toBe(1)
  })

  it("cancel drops waiting changes and ignores a running write's failure", async () => {
    const { autosave, timers, save, hold, release } = setup()
    autosave.schedule(1)
    autosave.cancel()
    timers.advance(1000)
    expect(save).not.toHaveBeenCalled()
    expect(autosave.pending()).toBe(false)
    expect(autosave.latest()).toBeUndefined()

    hold()
    autosave.schedule(2)
    timers.advance(400)
    autosave.cancel()
    release(false)
    await settle()
    expect(autosave.state).toBe("idle")
    expect(timers.pending).toBe(0)
  })
})
