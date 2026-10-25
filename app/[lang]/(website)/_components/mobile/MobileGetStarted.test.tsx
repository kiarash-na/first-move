import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { MobileGetStarted } from './MobileGetStarted'

describe('MobileGetStarted', () => {
  it('leads to the localized dashboard and the documentation', () => {
    render(<MobileGetStarted t={en} lang="de" />)
    const copy = en.closing.getStarted
    expect(document.getElementById('m-get-started')).toBeInTheDocument()
    expect(screen.getByText(copy.body)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: copy.primary })).toHaveAttribute('href', '/de/dashboard')
    expect(screen.getByRole('link', { name: copy.secondary })).toHaveAttribute('href', '/de/docs')
  })
})
