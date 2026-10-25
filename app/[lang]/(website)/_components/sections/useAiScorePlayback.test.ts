import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAiScorePlayback, useCountUp } from './useAiScorePlayback'

type Callback = (entries: { isIntersecting: boolean }[]) => void
let intersect: Callback | null = null
let reduced = false

beforeEach(() => {
  vi.useFakeTimers()
  intersect = null
  reduced = false
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: Callback) {
      intersect = callback
    }
    observe() {}
    disconnect() {}
    unobserve() {}
  })
  vi.stubGlobal('matchMedia', () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} }))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('useAiScorePlayback', () => {
  it('waits for the console to scroll into view, then steps through the turns to the score', () => {
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() => useAiScorePlayback(ref, 4, 100))
    expect(result.current.step).toBe(0)
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.step).toBe(0)

    act(() => intersect?.([{ isIntersecting: true }]))
    act(() => vi.advanceTimersByTime(100))
    expect(result.current.step).toBe(1)
    act(() => vi.advanceTimersByTime(400))
    expect(result.current.step).toBe(5)
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.step).toBe(5)
    expect(result.current.final).toBe(5)
  })

  it('replays from the start', () => {
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() => useAiScorePlayback(ref, 2, 100))
    act(() => intersect?.([{ isIntersecting: true }]))
    act(() => vi.advanceTimersByTime(300))
    expect(result.current.step).toBe(3)
    act(() => result.current.replay())
    expect(result.current.step).toBe(0)
    act(() => vi.advanceTimersByTime(100))
    expect(result.current.step).toBe(1)
  })

  it('shows the final state at once with reduced motion', () => {
    reduced = true
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() => useAiScorePlayback(ref, 4, 100))
    act(() => intersect?.([{ isIntersecting: true }]))
    expect(result.current.step).toBe(5)
  })
})

describe('useCountUp', () => {
  it('is 0 while inactive and jumps to the target with reduced motion', () => {
    reduced = true
    const { result, rerender } = renderHook(({ active }) => useCountUp(60, active), { initialProps: { active: false } })
    expect(result.current).toBe(0)
    rerender({ active: true })
    expect(result.current).toBe(60)
  })

  it('counts up over animation frames and starts from 0 again on a new run', () => {
    let now = 0
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback))
    vi.stubGlobal('cancelAnimationFrame', () => {})
    const { result, rerender } = renderHook(({ active, run }) => useCountUp(60, active, run, 100), { initialProps: { active: true, run: 0 } })
    expect(result.current).toBe(0)
    now = 100
    act(() => frames.shift()?.(now))
    expect(result.current).toBe(60)
    rerender({ active: false, run: 0 })
    expect(result.current).toBe(0)
    rerender({ active: true, run: 1 })
    expect(result.current).toBe(0)
  })

  it('never shows a negative value when the first frame is stamped before the count started', () => {
    vi.spyOn(performance, 'now').mockImplementation(() => 1_000)
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback))
    vi.stubGlobal('cancelAnimationFrame', () => {})
    const { result } = renderHook(() => useCountUp(60, true, 0, 900))
    act(() => frames.shift()?.(984))
    expect(result.current).toBe(0)
    expect(Object.is(result.current, -0)).toBe(false)
    act(() => frames.shift()?.(1_450))
    expect(result.current).toBeGreaterThan(0)
    act(() => frames.shift()?.(1_900))
    expect(result.current).toBe(60)
  })
})
