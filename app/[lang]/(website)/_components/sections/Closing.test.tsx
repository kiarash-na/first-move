import { render, screen } from '@testing-library/react'
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

  it('renders the methodology rows from the dictionary', () => {
    render(<Closing t={en} lang="en" />)
    for (const row of en.closing.methodology.rows) expect(screen.getByRole('heading', { name: row.title })).toBeInTheDocument()
  })
})
