import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import common from '@/dictionaries/en/common.json'
import en from '@/dictionaries/en/landing.json'
import { MobileLanding } from './MobileLanding'

vi.mock('next/navigation', () => ({ usePathname: () => '/en' }))

/** The chapters in page order; the menu reaches the five that the desktop nav names. */
const CHAPTERS = [
  'm-overview', 'm-system', 'm-tools', 'm-quick-check', 'm-assessment', 'm-results', 'm-business-models', 'm-canvas',
  'm-reality-check', 'm-scalability', 'm-implementation', 'm-ai-score', 'm-methodology', 'm-get-started',
]

/** Ids of the desktop tree: both trees share one document before hydration, so none may repeat here (D-LM-7). */
const DESKTOP_IDS = ['overview', 'promise', 'tools', 'quick-inputs', 'business-use-cases', 'ai-score', 'methodology', 'get-started', 'mobile-navigation', 'network', 'start']

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} unobserve() {} })
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }))
})
afterEach(() => vi.unstubAllGlobals())

describe('MobileLanding', () => {
  it('renders every chapter in the desktop order, one main, the header and the footer', () => {
    render(<MobileLanding t={en} lang="en" language={common.language} />)
    const ids = CHAPTERS.map((id) => document.getElementById(id))
    ids.forEach((element, index) => expect(element, CHAPTERS[index]).not.toBeNull())
    // In page order.
    for (let index = 1; index < ids.length; index++) {
      expect(ids[index - 1]!.compareDocumentPosition(ids[index]!) & Node.DOCUMENT_POSITION_FOLLOWING, CHAPTERS[index]).toBeTruthy()
    }
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: en.hero.titleLabel })).toBeInTheDocument()
  })

  it('uses only m- prefixed ids, so nothing collides with the desktop tree', () => {
    render(<MobileLanding t={en} lang="en" language={common.language} />)
    for (const id of DESKTOP_IDS) expect(document.getElementById(id), id).toBeNull()
    const ids = Array.from(document.querySelectorAll('[id]')).map((element) => element.id)
    expect(ids.length).toBeGreaterThan(CHAPTERS.length)
    for (const id of ids) expect(id.startsWith('m-') || id.startsWith('brand-mark-glow-') || id.includes(':'), id).toBe(true)
  })

  it('links every Get Started to the localized dashboard', () => {
    render(<MobileLanding t={en} lang="de" language={common.language} />)
    const links = screen.getAllByRole('link', { name: new RegExp(`^${en.closing.getStarted.primary}$`, 'i') })
    expect(links.length).toBeGreaterThanOrEqual(2)
    for (const link of links) expect(link).toHaveAttribute('href', '/de/dashboard')
  })
})
