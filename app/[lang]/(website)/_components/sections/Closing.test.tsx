import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { Closing } from './Closing'

describe('landing Closing', () => {
  it('links Get Started and the footer tools to the localized dashboard (PLAN-DASH-02 step 3)', () => {
    render(<Closing t={en} lang="de" />)
    expect(screen.getByRole('link', { name: en.closing.getStarted.primary })).toHaveAttribute('href', '/de/dashboard')
    expect(screen.getByRole('link', { name: en.closing.footer.quickCheck })).toHaveAttribute('href', '/de/dashboard')
    expect(screen.getByRole('link', { name: en.closing.footer.businessModels })).toHaveAttribute('href', '/de/dashboard')
    expect(screen.getByRole('link', { name: en.closing.getStarted.secondary })).toHaveAttribute('href', '#business-use-cases')
  })

  it('links the six legal pages and the source code from the footer, localized', () => {
    render(<Closing t={en} lang="de" />)
    const nav = screen.getByRole('navigation', { name: en.closing.footer.legal.nav })
    const hrefs = within(nav).getAllByRole('link').map((link) => link.getAttribute('href'))
    expect(hrefs).toEqual([
      '/de/terms', '/de/privacy', '/de/cookies', '/de/imprint', '/de/ai', '/de/license',
      'https://github.com/kiarash-na/first-move',
    ])
    expect(within(nav).getByRole('link', { name: en.closing.footer.legal.imprint })).toBeInTheDocument()
  })

  it('places "Brought to you by" right under the screening boundary, inside the methodology section (D-69)', () => {
    const { container } = render(<Closing t={en} lang="en" />)
    const region = screen.getByRole('region', { name: en.closing.partners.label })
    expect(container.querySelector('.screening-boundary')?.nextElementSibling).toBe(region)
    expect(container.querySelector('#methodology')).toContainElement(region)
    expect(container.querySelector('#get-started')).not.toContainElement(region)
  })

  it('names the footer brand link by its visible text and where it leads (WCAG 2.5.3)', () => {
    render(<Closing t={en} lang="en" />)
    const { brandName, brandTag, brandBack } = en.closing.footer
    expect(screen.getByRole('link', { name: `${brandName} ${brandTag}, ${brandBack}` })).toHaveAttribute('href', '#overview')
  })

  it('renders the methodology rows from the dictionary', () => {
    render(<Closing t={en} lang="en" />)
    for (const row of en.closing.methodology.rows) expect(screen.getByRole('heading', { name: row.title })).toBeInTheDocument()
  })
})
