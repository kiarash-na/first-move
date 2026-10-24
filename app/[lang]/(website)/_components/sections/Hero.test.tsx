import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { Hero } from './Hero'

describe('landing Hero', () => {
  it('renders the slogan and the scene label of the selected tool', () => {
    const { rerender } = render(
      <Hero t={en} selectedTool={null} flowDirection={1} onFlowDirectionChange={() => {}} onToolSelect={() => {}} />,
    )
    expect(screen.getByRole('heading', { level: 1, name: en.hero.titleLabel })).toBeInTheDocument()
    expect(screen.getByText(en.hero.sceneDefault)).toBeInTheDocument()
    rerender(<Hero t={en} selectedTool="quick-check" flowDirection={1} onFlowDirectionChange={() => {}} onToolSelect={() => {}} />)
    expect(screen.getByText(en.hero.tools.quickCheck.sceneLabel)).toBeInTheDocument()
  })

  it('reports the flow switch', () => {
    const onFlowDirectionChange = vi.fn()
    render(<Hero t={en} selectedTool={null} flowDirection={1} onFlowDirectionChange={onFlowDirectionChange} onToolSelect={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(en.hero.reverseFlow, 'i') }))
    expect(onFlowDirectionChange).toHaveBeenCalledOnce()
  })
})
