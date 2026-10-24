'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDownRight, Menu, X } from 'lucide-react'

export type ToolId = 'quick-check' | 'business-models'

interface HeaderProps {
  onToolSelect: (tool: ToolId) => void
}

const navigation = [
  { label: 'The System', href: '#promise' },
  { label: 'Quick Check', href: '#quick-inputs', tool: 'quick-check' as const },
  { label: 'Business Models', href: '#business-use-cases', tool: 'business-models' as const },
  { label: 'Methodology', href: '#methodology' },
]

export function Header({ onToolSelect }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen])

  return (
    <header className="site-header" ref={headerRef}>
      <a className="brand" href="#overview" aria-label="5GDHC Operating System — back to top" onClick={() => setMenuOpen(false)}>
        <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M4 23.5 15.9 16 28 23.5" />
          <path d="M4 15.5 15.9 8 28 15.5" />
          <path className="brand__mark-hot" d="M15.9 8v8" />
        </svg>
        <span className="brand__name">5GDHC</span>
        <span className="brand__descriptor">Operating<br />System</span>
      </a>

      <nav className="main-nav" aria-label="Primary navigation">
        {navigation.map((item) => (
          <a key={item.href} href={item.href} onClick={() => item.tool && onToolSelect(item.tool)}>{item.label}</a>
        ))}
      </nav>

      <div className="header-actions">
        <a className="header-cta" href="#get-started" onClick={() => setMenuOpen(false)}>
          <span>Get Started</span><ArrowDownRight size={17} strokeWidth={1.8} aria-hidden="true" />
        </a>
        <button
          ref={menuButtonRef}
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} strokeWidth={1.6} aria-hidden="true" /> : <Menu size={20} strokeWidth={1.6} aria-hidden="true" />}
        </button>
      </div>

      <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation" hidden={!menuOpen}>
        {navigation.map((item) => (
          <a key={item.href} href={item.href} onClick={() => {
            if (item.tool) onToolSelect(item.tool)
            setMenuOpen(false)
          }}>{item.label}<ArrowDownRight size={17} strokeWidth={1.5} aria-hidden="true" /></a>
        ))}
      </nav>
    </header>
  )
}
