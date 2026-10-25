import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { SceneCallouts } from './SceneCallouts'

describe('SceneCallouts', () => {
  it('renders both labels hidden and off until the scene reports an anchor, and registers each element', () => {
    const registered: Record<string, HTMLDivElement | null> = {}
    const { container } = render(
      <SceneCallouts copy={en.hero} register={(id) => (element) => { registered[id] = element }} />,
    )
    const callouts = container.querySelectorAll('.scene-callout')
    expect(callouts).toHaveLength(2)
    callouts.forEach((callout) => {
      expect(callout).toHaveAttribute('aria-hidden', 'true')
      expect(callout).toHaveAttribute('data-on', 'false')
    })
    expect(registered.flow).toHaveTextContent(en.hero.annotationTop)
    expect(registered.source).toHaveTextContent(en.hero.annotationSide)
  })
})
