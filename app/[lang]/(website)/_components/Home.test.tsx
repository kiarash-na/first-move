import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import common from '@/dictionaries/en/common.json'
import en from '@/dictionaries/en/landing.json'
import Home from './Home'

vi.mock('next/navigation', () => ({ usePathname: () => '/en' }))
// WebGL is not available in jsdom; the scene has no copy.
vi.mock('./DistrictScene', () => ({ DistrictScene: () => null }))

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} unobserve() {} })
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }))
})
afterEach(() => vi.unstubAllGlobals())

describe('landing Home', () => {
  it('renders every chapter from the dictionary and links Get Started to the dashboard', () => {
    render(<Home t={en} lang="en" language={common.language} />)
    expect(screen.getByRole('heading', { level: 1, name: en.hero.titleLabel })).toBeInTheDocument()
    for (const id of ['overview', 'promise', 'quick-inputs', 'business-use-cases', 'ai-score', 'methodology', 'get-started']) {
      expect(document.getElementById(id), id).not.toBeNull()
    }
    for (const link of screen.getAllByRole('link', { name: new RegExp(en.closing.getStarted.primary, 'i') })) {
      expect(link).toHaveAttribute('href', '/en/dashboard')
    }
  })
})
