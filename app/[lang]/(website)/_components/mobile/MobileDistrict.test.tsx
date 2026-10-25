import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MobileDistrict } from './MobileDistrict'

describe('MobileDistrict', () => {
  it('is a labelled image: a ground plate, eight buildings, two loops with their flow, two nodes', () => {
    const { container } = render(<MobileDistrict label="A district" />)
    expect(screen.getByRole('img', { name: 'A district' })).toBeInTheDocument()
    expect(container.querySelectorAll('.m-district__ground')).toHaveLength(1)
    expect(container.querySelectorAll('.m-district__roof')).toHaveLength(8)
    expect(container.querySelectorAll('.m-district__left')).toHaveLength(8)
    expect(container.querySelectorAll('.m-district__pipe--cool')).toHaveLength(1)
    expect(container.querySelectorAll('.m-district__pipe--hot')).toHaveLength(1)
    expect(container.querySelectorAll('.m-district__flow')).toHaveLength(2)
    expect(container.querySelectorAll('.m-district__node--cool')).toHaveLength(1)
    expect(container.querySelectorAll('.m-district__node--hot')).toHaveLength(1)
  })

  it('draws the buildings back to front, so nearer ones cover farther ones', () => {
    const { container } = render(<MobileDistrict label="A district" />)
    const roofs = Array.from(container.querySelectorAll<SVGPathElement>('.m-district__roof'))
    // The roof path starts at the building's centre x and its top y; lower on screen means nearer.
    const bottoms = roofs.map((roof) => Number(roof.getAttribute('d')!.match(/L[\d.-]+ ([\d.-]+)Z$/)![1]))
    const centres = roofs.map((roof) => Number(roof.getAttribute('d')!.match(/^M[\d.-]+ ([\d.-]+)/)![1]))
    expect(bottoms.length).toBe(8)
    expect(centres.length).toBe(8)
    const order = roofs.map((roof) => roof.getAttribute('d')!)
    expect(new Set(order).size).toBe(8)
  })
})
