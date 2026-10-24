import type { MDXComponents } from "mdx/types"

/**
 * Global MDX components (required by @next/mdx in the App Router). They stay empty: the docs
 * route passes its own elements to each page (`docs/[[...slug]]/_components/mdx/`, D-22, D-34).
 */
const components: MDXComponents = {}

export function useMDXComponents(): MDXComponents {
  return components
}
