/**
 * The runtime dependencies and fonts First Move ships, with their licences, for the Licence page.
 * Curated, not generated: `third-party.test.ts` fails when `package.json` gains a dependency that
 * is not listed here, or a listed licence differs from the installed package.
 */
export interface ThirdPartyEntry {
  name: string
  license: string
  url: string
  /** What it is used for, in one phrase (technical term, not translated). */
  role: string
}

export const THIRD_PARTY: readonly ThirdPartyEntry[] = [
  { name: "next", license: "MIT", url: "https://nextjs.org", role: "Framework" },
  { name: "react", license: "MIT", url: "https://react.dev", role: "UI library" },
  { name: "react-dom", license: "MIT", url: "https://react.dev", role: "UI library" },
  { name: "@next/mdx", license: "MIT", url: "https://nextjs.org", role: "MDX support" },
  { name: "@mdx-js/loader", license: "MIT", url: "https://mdxjs.com", role: "MDX support" },
  { name: "@mdx-js/react", license: "MIT", url: "https://mdxjs.com", role: "MDX support" },
  { name: "remark-gfm", license: "MIT", url: "https://github.com/remarkjs/remark-gfm", role: "Markdown tables" },
  { name: "radix-ui", license: "MIT", url: "https://radix-ui.com/primitives", role: "Accessible UI primitives" },
  { name: "class-variance-authority", license: "Apache-2.0", url: "https://github.com/joe-bell/cva", role: "Style variants" },
  { name: "clsx", license: "MIT", url: "https://github.com/lukeed/clsx", role: "Class names" },
  { name: "tailwind-merge", license: "MIT", url: "https://github.com/dcastil/tailwind-merge", role: "Class names" },
  { name: "lucide-react", license: "ISC", url: "https://lucide.dev", role: "Icons" },
  { name: "recharts", license: "MIT", url: "https://github.com/recharts/recharts", role: "Charts" },
  { name: "three", license: "MIT", url: "https://threejs.org", role: "3D scene on the start page" },
  { name: "sonner", license: "MIT", url: "https://sonner.emilkowal.ski", role: "Notifications" },
  { name: "zod", license: "MIT", url: "https://zod.dev", role: "Data validation" },
  { name: "zustand", license: "MIT", url: "https://github.com/pmndrs/zustand", role: "State" },
  { name: "idb", license: "ISC", url: "https://github.com/jakearchibald/idb", role: "IndexedDB wrapper" },
  { name: "server-only", license: "MIT", url: "https://www.npmjs.com/package/server-only", role: "Build-time guard" },
  { name: "workflow", license: "Apache-2.0", url: "https://workflow-sdk.dev", role: "Durable email processing" },
  { name: "unpdf", license: "MIT", url: "https://github.com/unjs/unpdf", role: "PDF text for the AI assistants" },
  { name: "mammoth", license: "BSD-2-Clause", url: "https://github.com/mwilliamson/mammoth.js", role: "Word text for the AI assistants" },
  { name: "read-excel-file", license: "MIT", url: "https://gitlab.com/catamphetamine/read-excel-file", role: "Excel values for the AI assistants" },
  { name: "ai", license: "Apache-2.0", url: "https://ai-sdk.dev", role: "AI SDK: the email agent's guard decisions" },
  { name: "resend", license: "MIT", url: "https://github.com/resend/resend-node", role: "Receiving and sending the email agent's mail" },
  { name: "@upstash/redis", license: "MIT", url: "https://github.com/upstash/redis-js", role: "The email agent's encrypted state" },
  { name: "@fontsource-variable/archivo", license: "OFL-1.1", url: "https://fontsource.org/fonts/archivo", role: "Font Archivo" },
  { name: "@fontsource/ibm-plex-mono", license: "OFL-1.1", url: "https://fontsource.org/fonts/ibm-plex-mono", role: "Font IBM Plex Mono" },
]
