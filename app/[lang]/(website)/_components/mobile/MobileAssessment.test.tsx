import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { MobileAssessment } from './MobileAssessment'

describe('MobileAssessment', () => {
  it('shows the three states as buttons and the promising result with its three reasons first', () => {
    const { container } = render(<MobileAssessment t={en} />)
    const copy = en.quickCheck.assessment
    expect(document.getElementById('m-assessment')).toBeInTheDocument()
    const group = screen.getByRole('group', { name: copy.scaleLabel })
    expect(group.querySelectorAll('button')).toHaveLength(3)
    expect(screen.getByRole('button', { name: new RegExp(copy.states.promising.label) })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { level: 3, name: copy.states.promising.label })).toBeInTheDocument()
    expect(container.querySelector('.m-result')).toHaveClass('m-result--promising')
    for (const factor of ['technical', 'source', 'economic'] as const) expect(screen.getByText(copy.states.promising[factor])).toBeInTheDocument()
    expect(screen.getByText(copy.note)).toBeInTheDocument()
  })

  it('switches the result to the chosen state', () => {
    const { container } = render(<MobileAssessment t={en} />)
    const copy = en.quickCheck.assessment
    fireEvent.click(screen.getByRole('button', { name: new RegExp(copy.states.notPromising.label) }))
    expect(screen.getByRole('heading', { level: 3, name: copy.states.notPromising.label })).toBeInTheDocument()
    expect(screen.getByText(copy.states.notPromising.summary)).toBeInTheDocument()
    expect(container.querySelector('.m-result')).toHaveClass('m-result--not-promising')
    expect(screen.getByRole('button', { name: new RegExp(copy.states.promising.label) })).toHaveAttribute('aria-pressed', 'false')
  })
})
