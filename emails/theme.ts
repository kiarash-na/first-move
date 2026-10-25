import "server-only"

/**
 * The email palette (PLAN-AGENT-07 step 10, D-15, D-16): the light report tokens of
 * `app/globals.css` as hex, because mail clients do not read `oklch()`. Cyan marks the Quick
 * Check, orange the Business Plan and risks; no other hues. `theme.test.ts` converts the CSS
 * tokens and pins these values.
 */
export const COLORS = {
  /** `--ink-950`: text, and the brand band. */
  ink: "#04090d",
  /** `--paper-100`: the page. */
  paper: "#e6f1f2",
  /** Light `--surface-raised`: cards. */
  raised: "#f7fbfb",
  /** `--report-surface`: sunken panels. */
  sunken: "#e2eeee",
  /** `--text-secondary-on-light`. */
  secondary: "#2c3e44",
  /** Light `--text-muted`. */
  muted: "#4c5e65",
  /** `--accent-on-light`: the cyan role on light surfaces (Quick Check, links). */
  cool: "#007192",
  /** Light `--accent-hot`: the orange role on light surfaces (Business Plan, risks). */
  hot: "#b24b0a",
  /** `--cyan-500` and `--orange-500`: the two nodes of the logo on the dark band. */
  cyanNode: "#00f6ff",
  orangeNode: "#ff7300",
  /** `--paper-300` on the dark band. */
  bandText: "#a6bcc1",
  /** Light `--line-subtle` (ink at 14 % on paper) and the stronger control border (28 %). */
  line: "#c6d1d1",
  lineStrong: "#a6b0b1",
} as const

/** Archivo and IBM Plex Mono are not loaded (no web fonts, no remote URLs); these stacks stand in. */
export const FONTS = {
  sans: "Archivo, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'IBM Plex Mono', Menlo, Consolas, 'Courier New', monospace",
} as const

/** Content width: one column that reads on a phone and does not sprawl on a desktop. */
export const WIDTH = 600

/** The colour of each accent role (D-15): cyan for the Quick Check, orange for the Business Plan and risks. */
export const ACCENTS = { cool: COLORS.cool, hot: COLORS.hot, ink: COLORS.ink } as const

/** Text styles shared by the templates, inline because mail clients drop `<style>` blocks. */
export const TEXT = {
  body: { fontFamily: FONTS.sans, fontSize: 15, lineHeight: 1.55, color: COLORS.ink, margin: "0 0 12px" },
  small: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 1.5, color: COLORS.muted, margin: "0 0 8px" },
  kicker: { fontFamily: FONTS.mono, fontSize: 11, lineHeight: 1.4, letterSpacing: "0.075em", textTransform: "uppercase", margin: "0 0 6px" },
  title: { fontFamily: FONTS.sans, fontSize: 21, lineHeight: 1.2, fontWeight: 600, letterSpacing: "-0.02em", color: COLORS.ink, margin: "0 0 14px" },
  mono: { fontFamily: FONTS.mono, fontSize: 13, lineHeight: 1.45, color: COLORS.ink },
} as const
