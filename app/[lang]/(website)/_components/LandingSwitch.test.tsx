import { act, render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DESKTOP_MIN_WIDTH, LandingSwitch } from './LandingSwitch'

function stubViewport(desktop: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === `(min-width: ${DESKTOP_MIN_WIDTH}px)` ? desktop : false,
    addEventListener() {},
    removeEventListener() {},
  }))
}

function Probe({ label, onMount }: { label: string; onMount: () => void }) {
  useEffect(() => onMount(), [onMount])
  return <p>{label}</p>
}

beforeEach(() => stubViewport(false))
afterEach(() => vi.unstubAllGlobals())

describe('LandingSwitch', () => {
  it('renders both landings on the server, so CSS can show one without reading the viewport', () => {
    const html = renderToString(<LandingSwitch desktop={<p>desktop</p>} mobile={<p>mobile</p>} />)
    expect(html).toContain('desktop')
    expect(html).toContain('mobile')
    expect(html).toContain('class="landing-desktop" data-variant="both"')
    expect(html).toContain('class="landing-mobile" data-variant="both"')
  })

  it('keeps only the mobile landing on a phone and only the desktop landing from 1024 px', () => {
    const { unmount } = render(<LandingSwitch desktop={<p>desktop</p>} mobile={<p>mobile</p>} />)
    expect(screen.getByText('mobile')).toBeInTheDocument()
    expect(screen.queryByText('desktop')).toBeNull()
    expect(document.querySelector('.landing-mobile')).toHaveAttribute('data-variant', 'mobile')
    unmount()

    stubViewport(true)
    render(<LandingSwitch desktop={<p>desktop</p>} mobile={<p>mobile</p>} />)
    expect(screen.getByText('desktop')).toBeInTheDocument()
    expect(screen.queryByText('mobile')).toBeNull()
    expect(document.querySelector('.landing-desktop')).toHaveAttribute('data-variant', 'desktop')
  })

  it('hydrates the server HTML on a phone without errors, drops the desktop tree and never runs its effects', async () => {
    const onDesktopMount = vi.fn()
    const onMobileMount = vi.fn()
    const ui = (
      <LandingSwitch
        desktop={<Probe label="desktop" onMount={onDesktopMount} />}
        mobile={<Probe label="mobile" onMount={onMobileMount} />}
      />
    )
    const container = document.createElement('div')
    container.innerHTML = renderToString(ui)
    document.body.appendChild(container)
    const serverMobileNode = container.querySelector('.landing-mobile p')
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})

    await act(async () => {
      render(ui, { container, hydrate: true })
    })

    expect(errors).not.toHaveBeenCalled()
    expect(screen.getByText('mobile')).toBeInTheDocument()
    expect(screen.queryByText('desktop')).toBeNull()
    expect(container.querySelectorAll('p')).toHaveLength(1)
    // Hydrated in place, not client-rendered from scratch: the server's node is the one that stays.
    expect(screen.getByText('mobile')).toBe(serverMobileNode)
    expect(onMobileMount).toHaveBeenCalledTimes(1)
    expect(onDesktopMount).not.toHaveBeenCalled()
    errors.mockRestore()
    container.remove()
  })

  it('keeps the boundary elements stable across re-renders, so a dehydrated boundary stays hydratable', () => {
    const desktop = <p>desktop</p>
    const mobile = <p>mobile</p>
    const { rerender } = render(<LandingSwitch desktop={desktop} mobile={mobile} />)
    const before = screen.getByText('mobile')
    rerender(<LandingSwitch desktop={desktop} mobile={mobile} />)
    expect(screen.getByText('mobile')).toBe(before)
  })
})
