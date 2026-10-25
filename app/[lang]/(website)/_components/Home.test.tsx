import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import common from '@/dictionaries/en/common.json'
import en from '@/dictionaries/en/landing.json'
import aiScore from '@/dictionaries/en/ai-score.json'
import { recordedRun } from '@/lib/presentation/blind-test/recorded-run'
import Home from './Home'

const run = recordedRun(aiScore.labels)

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
    render(<Home t={en} lang="en" language={common.language} run={run} />)
    expect(screen.getByRole('heading', { level: 1, name: en.hero.titleLabel })).toBeInTheDocument()
    for (const id of ['overview', 'promise', 'quick-inputs', 'business-use-cases', 'ai-score', 'methodology', 'get-started']) {
      expect(document.getElementById(id), id).not.toBeNull()
    }
    for (const link of screen.getAllByRole('link', { name: new RegExp(en.closing.getStarted.primary, 'i') })) {
      expect(link).toHaveAttribute('href', '/en/dashboard')
    }
  })

  it('links the public docs from the header nav and the footer (PLAN-LANDING-POLISH-00 step b)', () => {
    render(<Home t={en} lang="de" language={common.language} run={run} />)
    const nav = screen.getByRole('navigation', { name: en.header.primaryNav })
    expect(within(nav).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(['#promise', '#quick-inputs', '#business-use-cases', '#ai-score', '#methodology', '/de/docs'])
    const footer = screen.getByRole('navigation', { name: en.closing.footer.nav })
    expect(within(footer).getByRole('link', { name: en.closing.footer.docs })).toHaveAttribute('href', '/de/docs')
  })
})
