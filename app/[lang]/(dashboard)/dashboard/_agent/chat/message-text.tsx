"use client"

import Link from "next/link"
import { useMemo } from "react"

import { parseMarkdown, type Inline } from "@/lib/assistant/text/markdown"

/** Inline parts as React nodes: text stays text. */
function inlineNodes(parts: Inline[]) {
  return parts.map((part, index) => {
    switch (part.type) {
      case "strong":
        return <strong key={index} className="font-[600]">{part.text}</strong>
      case "code":
        return (
          <code key={index} className="bg-muted px-1 font-mono text-[0.9em]">
            {part.text}
          </code>
        )
      case "link":
        return (
          <Link key={index} href={part.href} className="text-foreground underline decoration-1 underline-offset-4 hover:text-cool">
            {part.text}
          </Link>
        )
      default:
        return <span key={index}>{part.text}</span>
    }
  })
}

/**
 * Model text, rendered safely (D-51): the Markdown subset of `parseMarkdown` as React text nodes.
 * No HTML is ever interpreted, no image is loaded, and links lead only to First Move pages.
 */
export function MessageText({ text }: { text: string }) {
  const blocks = useMemo(() => parseMarkdown(text), [text])
  return (
    <div data-slot="message-text" className="flex flex-col gap-2 text-sm leading-relaxed">
      {blocks.map((block, index) =>
        block.type === "paragraph" ? (
          <p key={index} className="whitespace-pre-line">
            {inlineNodes(block.inline)}
          </p>
        ) : block.ordered ? (
          <ol key={index} className="flex list-decimal flex-col gap-1 pl-5">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                {inlineNodes(item)}
              </li>
            ))}
          </ol>
        ) : (
          <ul key={index} className="flex list-disc flex-col gap-1 pl-5 marker:text-muted-foreground">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                {inlineNodes(item)}
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  )
}
