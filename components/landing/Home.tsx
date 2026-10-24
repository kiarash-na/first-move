'use client'

import { useState } from 'react'
import './landing.css'
import './story.css'
import { DistrictScene } from './DistrictScene'
import { Header, type ToolId } from './Header'
import { useActiveChapter, useScrollReveal } from './useLandingPage'
import { BusinessModelStory } from './sections/BusinessModelStory'
import { Closing } from './sections/Closing'
import { Hero } from './sections/Hero'
import { ProductStory } from './sections/ProductStory'
import { QuickCheckStory } from './sections/QuickCheckStory'

export default function Home() {
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
      <Header onToolSelect={setSelectedTool} />
      <main>
        <Hero
          selectedTool={selectedTool}
          flowDirection={flowDirection}
          onFlowDirectionChange={() => setFlowDirection((direction) => direction === 1 ? -1 : 1)}
          onToolSelect={setSelectedTool}
        />
        <ProductStory onToolSelect={setSelectedTool} />
        <QuickCheckStory onPreviewChange={(demand, source) => setPreviewInputs({ demand, source })} />
        <BusinessModelStory />
        <Closing />
      </main>
    </div>
  )
}
