import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { REVEAL_CLASS, useMobileReveal } from './useMobileReveal'

type Callback = (entries: { isIntersecting: boolean; target: Element }[]) => void

const instances: { callback: Callback; observed: Element[]; unobserved: Element[]; disconnected: boolean }[] = []

class FakeObserver {
  observed: Element[] = []
  unobserved: Element[] = []
  disconnected = false
  constructor(public callback: Callback) {
    instances.push(this)
  }
  observe(target: Element) {
    this.observed.push(target)
  }
  unobserve(target: Element) {
    this.unobserved.push(target)
  }
  disconnect() {
    this.disconnected = true
  }
}

function root() {
  const element = document.createElement('div')
  element.innerHTML = '<p data-m-reveal>a</p><p data-m-reveal>b</p><p>plain</p>'
  document.body.appendChild(element)
  return element
}

beforeEach(() => {
  instances.length = 0
  vi.stubGlobal('IntersectionObserver', FakeObserver)
})
afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('useMobileReveal', () => {
  it('with reduced motion shows every block at once and marks nothing as ready', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const element = root()
    renderHook(() => useMobileReveal({ current: element }))
    for (const block of element.querySelectorAll('[data-m-reveal]')) expect(block).toHaveClass(REVEAL_CLASS)
    expect(element.hasAttribute('data-ready')).toBe(false)
    expect(instances).toHaveLength(0)
  })

  it('otherwise marks the root ready, reveals a block once it intersects and stops watching it', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const element = root()
    const { unmount } = renderHook(() => useMobileReveal({ current: element }))
    expect(element.getAttribute('data-ready')).toBe('true')
    const [observer] = instances
    const blocks = Array.from(element.querySelectorAll('[data-m-reveal]'))
    expect(observer.observed).toEqual(blocks)
    for (const block of blocks) expect(block).not.toHaveClass(REVEAL_CLASS)

    observer.callback([{ isIntersecting: false, target: blocks[0] }, { isIntersecting: true, target: blocks[1] }])
    expect(blocks[0]).not.toHaveClass(REVEAL_CLASS)
    expect(blocks[1]).toHaveClass(REVEAL_CLASS)
    expect(observer.unobserved).toEqual([blocks[1]])

    unmount()
    expect(observer.disconnected).toBe(true)
    expect(element.hasAttribute('data-ready')).toBe(false)
  })

  it('without IntersectionObserver shows everything', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    vi.stubGlobal('IntersectionObserver', undefined)
    const element = root()
    renderHook(() => useMobileReveal({ current: element }))
    for (const block of element.querySelectorAll('[data-m-reveal]')) expect(block).toHaveClass(REVEAL_CLASS)
  })
})
