import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MobileRevealRoot } from './MobileRevealRoot'

beforeEach(() => vi.stubGlobal('matchMedia', () => ({ matches: true })))
afterEach(() => vi.unstubAllGlobals())

describe('MobileRevealRoot', () => {
  it('is the mobile landing root and reveals its blocks (reduced motion: at once)', () => {
    const { container } = render(
      <MobileRevealRoot>
        <p data-m-reveal>block</p>
      </MobileRevealRoot>,
    )
    expect(container.firstElementChild).toHaveClass('m-landing')
    expect(screen.getByText('block')).toHaveClass('is-in')
  })
})
