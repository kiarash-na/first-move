'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowDownRight, Menu, X } from 'lucide-react'
import { BrandMark } from '@/components/brand/brand-mark'
import { LanguageSwitch, type LanguageSwitchProps } from '@/components/language-switch/language-switch'
import { withLocale } from '@/lib/i18n/locale-path'
import { RichText } from './rich-text'
import type { LandingCopyProps } from './types'

export type ToolId = 'quick-check' | 'business-models'

interface HeaderProps extends LandingCopyProps {
  language: Omit<LanguageSwitchProps, 'lang' | 'className'>
  onToolSelect: (tool: ToolId) => void
}

export function Header({ t, lang, language, onToolSelect }: HeaderProps) {
  const copy = t.header
  const navigation = [
    { label: copy.nav.system, href: '#promise' },
    { label: copy.nav.quickCheck, href: '#quick-inputs', tool: 'quick-check' as const },
    { label: copy.nav.businessModels, href: '#business-use-cases', tool: 'business-models' as const },
    { label: copy.nav.methodology, href: '#methodology' },
  ]
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
      <a className="brand" href="#overview" aria-label={copy.brandLabel} onClick={() => setMenuOpen(false)}>
        <BrandMark className="brand__mark" />
        <span className="brand__name">{copy.brandName}</span>
        <span className="brand__descriptor"><RichText text={copy.brandDescriptor} /></span>
      </a>

      <nav className="main-nav" aria-label={copy.primaryNav}>
        {navigation.map((item) => (
          <a key={item.href} href={item.href} onClick={() => item.tool && onToolSelect(item.tool)}>{item.label}</a>
        ))}
      </nav>

      <div className="header-actions">
        <LanguageSwitch lang={lang} className="max-md:hidden" {...language} />
        <Link className="header-cta" href={withLocale('/dashboard', lang)} onClick={() => setMenuOpen(false)}>
          <span>{copy.getStarted}</span><ArrowDownRight size={17} strokeWidth={1.8} aria-hidden="true" />
        </Link>
        <button
          ref={menuButtonRef}
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? copy.closeMenu : copy.openMenu}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} strokeWidth={1.6} aria-hidden="true" /> : <Menu size={20} strokeWidth={1.6} aria-hidden="true" />}
        </button>
      </div>

      <nav className="mobile-nav" id="mobile-navigation" aria-label={copy.mobileNav} hidden={!menuOpen}>
        {navigation.map((item) => (
          <a key={item.href} href={item.href} onClick={() => {
            if (item.tool) onToolSelect(item.tool)
            setMenuOpen(false)
          }}>{item.label}<ArrowDownRight size={17} strokeWidth={1.5} aria-hidden="true" /></a>
        ))}
        <LanguageSwitch lang={lang} className="mobile-nav__language" {...language} />
      </nav>
    </header>
  )
}
