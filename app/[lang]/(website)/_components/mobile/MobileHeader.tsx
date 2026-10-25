'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowDownRight, Menu, X } from 'lucide-react'
import { BrandMark } from '@/components/brand/brand-mark'
import { LanguageSwitch, type LanguageSwitchProps } from '@/components/language-switch/language-switch'
import { withLocale } from '@/lib/i18n/locale-path'
import type { LandingCopyProps } from '../types'

/** The chapters the menu reaches, in page order; the ids are the mobile tree's (`m-` prefix, D-LM-7). */
export const MOBILE_CHAPTERS = [
  { key: 'system', id: 'm-system' },
  { key: 'quickCheck', id: 'm-quick-check' },
  { key: 'businessModels', id: 'm-business-models' },
  { key: 'aiScore', id: 'm-ai-score' },
  { key: 'methodology', id: 'm-methodology' },
] as const

interface MobileHeaderProps extends LandingCopyProps {
  language: Omit<LanguageSwitchProps, 'lang' | 'className'>
}

/** Fixed header: brand, "Get Started" and a menu button that opens the five chapters and the language switch. */
export function MobileHeader({ t, lang, language }: MobileHeaderProps) {
  const copy = t.header
  const [open, setOpen] = useState(false)
  const header = useRef<HTMLElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      toggle.current?.focus()
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <header className="m-header" ref={header}>
      {/* Named by its visible text plus where it leads, so the name contains the label (WCAG 2.5.3). */}
      <a className="m-brand" href="#m-overview" onClick={() => setOpen(false)}>
        <BrandMark className="m-brand__mark" />
        <span className="m-brand__name">{copy.brandName}</span>
        <span className="sr-only">, {copy.brandBack}</span>
      </a>

      <div className="m-header__actions">
        <Link className="m-header__cta" href={withLocale('/dashboard', lang)} onClick={() => setOpen(false)}>
          <span>{copy.getStarted}</span>
          <ArrowDownRight size={16} strokeWidth={1.8} aria-hidden="true" />
        </Link>
        <button
          ref={toggle}
          type="button"
          className="m-header__menu"
          aria-label={open ? copy.closeMenu : copy.openMenu}
          aria-expanded={open}
          aria-controls="m-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} strokeWidth={1.6} aria-hidden="true" /> : <Menu size={20} strokeWidth={1.6} aria-hidden="true" />}
        </button>
      </div>

      <nav className="m-menu" id="m-menu" aria-label={copy.mobileNav} hidden={!open}>
        {MOBILE_CHAPTERS.map((chapter) => (
          <a key={chapter.id} href={`#${chapter.id}`} onClick={() => setOpen(false)}>
            {copy.nav[chapter.key]}
            <ArrowDownRight size={17} strokeWidth={1.5} aria-hidden="true" />
          </a>
        ))}
        <LanguageSwitch lang={lang} className="m-menu__language" {...language} />
      </nav>
    </header>
  )
}
