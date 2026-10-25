import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { MobileCanvas } from './MobileCanvas'

describe('MobileCanvas', () => {
  it('shows the six canvas blocks and the four allocation roles', () => {
    const { container } = render(<MobileCanvas t={en} />)
    const copy = en.businessModels.canvas
    expect(document.getElementById('m-canvas')).toBeInTheDocument()
    expect(container.querySelectorAll('.m-canvas article')).toHaveLength(6)
    for (const block of copy.blocks) expect(screen.getByRole('heading', { level: 3, name: block.title })).toBeInTheDocument()
    expect(screen.getByText(copy.allocationKicker)).toBeInTheDocument()
    for (const role of ['benefits', 'pays', 'owns', 'operates'] as const) {
      expect(screen.getByText(copy.roles[role].label)).toBeInTheDocument()
      expect(screen.getByText(copy.roles[role].title)).toBeInTheDocument()
      expect(screen.getByText(copy.roles[role].text)).toBeInTheDocument()
    }
  })
})
