import type { MDXComponents } from "mdx/types"

/**
 * Global MDX components (required by @next/mdx in the App Router).
 * Docs styling is added with the docs content later (D-22).
 */
const components: MDXComponents = {}

export function useMDXComponents(): MDXComponents {
  return components
}
