import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { MobileMethodology } from './MobileMethodology'

describe('MobileMethodology', () => {
  it('shows the five rows, the screening boundary and the partners inside the chapter', () => {
    const { container } = render(<MobileMethodology t={en} />)
    const { methodology, partners } = en.closing
    const section = document.getElementById('m-methodology')!
    expect(section).toHaveAttribute('aria-labelledby', 'm-methodology-title')
    for (const row of methodology.rows) expect(screen.getByRole('heading', { level: 3, name: row.title })).toBeInTheDocument()
    expect(container.querySelector('.m-boundary')).toHaveTextContent(`${methodology.boundaryLead} ${methodology.boundaryStrong}`)
    expect(container.querySelector('.m-boundary strong')).toHaveTextContent(methodology.boundaryStrong)
    const region = screen.getByRole('region', { name: partners.label })
    expect(section).toContainElement(region)
    expect(container.querySelector('.m-boundary')?.nextElementSibling).toBe(region)
  })
})
