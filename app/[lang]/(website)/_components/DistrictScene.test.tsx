import { act, render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DistrictEvents, DistrictInputs } from './districtWorld'
import { DistrictScene } from './DistrictScene'

// WebGL is not available in jsdom: the three.js module is replaced by a recorder.
const world = vi.hoisted(() => ({
  mount: vi.fn<(container: HTMLDivElement, inputs: DistrictInputs, events: DistrictEvents) => () => void>(),
  unmount: vi.fn(),
}))
vi.mock('./districtWorld', () => ({ mountDistrictWorld: world.mount }))

beforeEach(() => {
  world.mount.mockReset().mockReturnValue(world.unmount)
  world.unmount.mockReset()
})

const props = { flowDirection: 1 as const, emphasis: null, chapter: 'overview', demandDensity: 78, sourceAvailability: 72 }

describe('DistrictScene', () => {
  it('shows the SVG fallback first and loads the three.js district after mount', async () => {
    const { container } = render(<DistrictScene {...props} />)
    const scene = container.querySelector('.district-scene')!
    expect(container.querySelector('.scene-fallback svg')).not.toBeNull()
    expect(scene).not.toHaveClass('district-scene--ready')

    await waitFor(() => expect(world.mount).toHaveBeenCalledTimes(1))
    const [target, inputs, events] = world.mount.mock.calls[0]
    expect(target).toBe(scene)
    expect(inputs.chapterRef.current).toBe('overview')

    act(() => events.onReady())
    expect(scene).toHaveClass('district-scene--ready')
    act(() => events.onContextLost())
    expect(scene).not.toHaveClass('district-scene--ready')
  })

  it('passes prop changes through the refs without re-mounting, and cleans up on unmount', async () => {
    const { rerender, unmount } = render(<DistrictScene {...props} />)
    await waitFor(() => expect(world.mount).toHaveBeenCalledTimes(1))
    rerender(<DistrictScene {...props} chapter="promise" flowDirection={-1} />)
    const [, inputs] = world.mount.mock.calls[0]
    expect(inputs.chapterRef.current).toBe('promise')
    expect(inputs.directionRef.current).toBe(-1)
    expect(world.mount).toHaveBeenCalledTimes(1)
    unmount()
    expect(world.unmount).toHaveBeenCalledTimes(1)
  })

  it('keeps the fallback when WebGL is not available', async () => {
    const { container } = render(<DistrictScene {...props} />)
    await waitFor(() => expect(world.mount).toHaveBeenCalledTimes(1))
    const [, , events] = world.mount.mock.calls[0]
    act(() => {
      events.onFailed()
      events.onReady()
    })
    expect(container.querySelector('.district-scene')).not.toHaveClass('district-scene--ready')
  })
})
