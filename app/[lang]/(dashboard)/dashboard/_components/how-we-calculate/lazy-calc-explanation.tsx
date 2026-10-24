"use client"

import dynamic from "next/dynamic"

import { Skeleton } from "@/components/ui/skeleton"

/*
 * The explanation body carries the pre-rendered MathML of every formula (`equations.gen.ts`,
 * about 40 kB). "How we calculate" is collapsed by default (D-33), so the body is loaded only
 * when a disclosure or popover opens, or a moment earlier when its trigger is pointed at or
 * focused (`preloadCalcExplanation`). The bundler caches the import, so it loads once.
 */
const load = () => import("./calc-explanation")

/** Starts loading the explanation body; call it on pointer enter or focus of a trigger. */
export function preloadCalcExplanation() {
  void load()
}

/** Shown for the moment the body is loading: two quiet bars, no text. */
export function CalcExplanationSkeleton() {
  return (
    <div data-slot="calc-explanation-loading" aria-busy="true" className="flex flex-col gap-3">
      <Skeleton className="h-4 w-full max-w-[48ch]" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

/** `CalcExplanation`, loaded on first open. */
export const LazyCalcExplanation = dynamic(() => load().then((module) => module.CalcExplanation), {
  loading: () => <CalcExplanationSkeleton />,
})
