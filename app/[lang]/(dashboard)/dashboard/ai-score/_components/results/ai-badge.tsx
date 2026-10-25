"use client"

import { SparklesIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { useDictionary } from "../../../_components/i18n-provider"

/** Marks AI output (D-73): an outlined orange tag with an icon and the word, never colour alone. */
export function AiBadge({ className }: { className?: string }) {
  const copy = useDictionary("ai-score").results
  return (
    <Badge variant="hot" data-slot="ai-badge" className={className}>
      <SparklesIcon strokeWidth={1.6} aria-hidden="true" />
      {copy.aiGenerated}
    </Badge>
  )
}
