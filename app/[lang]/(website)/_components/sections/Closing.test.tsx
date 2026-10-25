import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { Closing } from './Closing'

describe('landing Closing', () => {
  it('links Get Started to the localized dashboard and the footer modules to their docs pages (PLAN-DASH-02 step 3, D-LP-3)', () => {
    render(<Closing t={en} lang="de" />)
    expect(screen.getByRole('link', { name: en.closing.getStarted.primary })).toHaveAttribute('href', '/de/dashboard')
    expect(screen.getByRole('link', { name: en.closing.getStarted.secondary })).toHaveAttribute('href', '/de/docs')
    const nav = screen.getByRole('navigation', { name: en.closing.footer.nav })
    expect(within(nav).getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
      [en.closing.footer.quickCheck, '/de/docs/quick-check'],
      [en.closing.footer.businessModels, '/de/docs/business-plan'],
      [en.closing.footer.methodology, '#methodology'],
      [en.closing.footer.docs, '/de/docs'],
    ])
  })

  it('links the presentation from the legal row, which stays visible at every width (PLAN-PRESENTATION-00)', () => {
    render(<Closing t={en} lang="de" />)
    const legal = screen.getByRole('navigation', { name: en.closing.footer.legal.nav })
    expect(within(legal).getByRole('link', { name: en.presentation.footer })).toHaveAttribute('href', '/de/presentation')
    expect(screen.getAllByRole('link', { name: en.presentation.footer })).toHaveLength(1)
  })

  it('links the six legal pages, the presentation and the source code from the footer, localized', () => {
    render(<Closing t={en} lang="de" />)
    const nav = screen.getByRole('navigation', { name: en.closing.footer.legal.nav })
    const hrefs = within(nav).getAllByRole('link').map((link) => link.getAttribute('href'))
    expect(hrefs).toEqual([
      '/de/terms', '/de/privacy', '/de/cookies', '/de/imprint', '/de/ai', '/de/license',
      '/de/presentation',
      'https://github.com/kiarash-na/first-move',
    ])
    expect(within(nav).getByRole('link', { name: en.closing.footer.legal.imprint })).toBeInTheDocument()
  })

  it('places "Supported by" right under the screening boundary, inside the methodology section (D-69)', () => {
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
