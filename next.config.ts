import createMDX from "@next/mdx"
import type { NextConfig } from "next"
import { withWorkflow } from "workflow/next"

const isDev = process.env.NODE_ENV === "development"

/**
 * Hosts the in-app assistant calls with the visitor's own key (D-42, D-48).
 * Allowed on dashboard pages only; every other page keeps `connect-src 'self'`.
 */
export const AI_PROVIDER_ORIGINS = ["https://api.anthropic.com", "https://openrouter.ai"] as const

/** Dashboard pages, and every other path. The two sources never match the same path. */
export const DASHBOARD_SOURCE = "/:lang(en|de)/dashboard/:path*"
export const OTHER_SOURCE = "/:path((?!(?:en|de)/dashboard(?:/|$)).*)"

/**
 * CSP without nonces, so page shells stay static (CSP guide, "Without Nonces"; D-14).
 * Project data stays in the browser except for requests the user starts (D-48). Dev needs 'unsafe-eval'.
 */
function contentSecurityPolicy(connectSrc: readonly string[]) {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    `connect-src ${["'self'", ...connectSrc].join(" ")}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(process.env.VERCEL ? ["upgrade-insecure-requests"] : []),
  ].join("; ")
}

function securityHeaders(connectSrc: readonly string[]) {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(connectSrc) },
    { key: "Referrer-Policy", value: "no-referrer" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  ]
}

export const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
    globalNotFound: true,
  },
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  pageExtensions: ["ts", "tsx", "js", "jsx", "mdx"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: OTHER_SOURCE, headers: securityHeaders([]) },
      { source: DASHBOARD_SOURCE, headers: securityHeaders(AI_PROVIDER_ORIGINS) },
    ]
  },
}

// Plugins are passed as strings so Turbopack can serialise them (MDX guide).
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
  },
})

// Workflow SDK: compiles "use workflow" / "use step" for the email agent (PLAN-AGENT-01).
export default withWorkflow(withMDX(nextConfig))
