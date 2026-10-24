'use client'

import { useState } from 'react'
import './landing.css'
import './story.css'
import { DistrictScene } from './DistrictScene'
import { Header, type ToolId } from './Header'
import type { LanguageSwitchProps } from '@/components/language-switch/language-switch'
import type { LandingCopyProps } from './types'
import { useActiveChapter, useScrollReveal } from './useLandingPage'
import { BusinessModelStory } from './sections/BusinessModelStory'
import { Closing } from './sections/Closing'
import { Hero } from './sections/Hero'
import { ProductStory } from './sections/ProductStory'
import { QuickCheckStory } from './sections/QuickCheckStory'

interface HomeProps extends LandingCopyProps {
  language: Omit<LanguageSwitchProps, 'lang' | 'className'>
}

export default function Home({ t, lang, language }: HomeProps) {
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null)
  const [flowDirection, setFlowDirection] = useState<1 | -1>(1)
  const [previewInputs, setPreviewInputs] = useState({ demand: 78, source: 72 })
  const chapter = useActiveChapter()
  useScrollReveal()

  return (
    <div className="site-shell">
      <div className="world-scene" id="network" aria-hidden="true">
        <DistrictScene
          flowDirection={flowDirection}
          emphasis={selectedTool}
          chapter={chapter}
          demandDensity={previewInputs.demand}
          sourceAvailability={previewInputs.source}
        />
      </div>
      <Header t={t} lang={lang} language={language} onToolSelect={setSelectedTool} />
      <main>
        <Hero
          t={t}
          selectedTool={selectedTool}
          flowDirection={flowDirection}
          onFlowDirectionChange={() => setFlowDirection((direction) => direction === 1 ? -1 : 1)}
          onToolSelect={setSelectedTool}
        />
        <ProductStory t={t} onToolSelect={setSelectedTool} />
        <QuickCheckStory t={t} onPreviewChange={(demand, source) => setPreviewInputs({ demand, source })} />
        <BusinessModelStory t={t} />
        <Closing t={t} lang={lang} />
      </main>
    </div>
  )
}
