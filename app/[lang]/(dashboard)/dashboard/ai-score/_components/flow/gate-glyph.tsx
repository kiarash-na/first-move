import type { AiGateOutcome } from "@/lib/project"

const DIAMOND = "10,1.5 18.5,10 10,18.5 1.5,10"
const HALF = "10,1.5 10,18.5 1.5,10"

/**
 * A check's outcome as a diamond whose fill and mark differ, so the four outcomes never rest on
 * colour alone: pass = outline with a tick, fail = solid orange (risk) with a cross, unclear = half
 * filled with a question mark, not asked = dashed outline with a dash.
 */
export function GateGlyph({ outcome, size = 20 }: { outcome: AiGateOutcome; size?: number }) {
  return (
    <svg data-slot="gate-glyph" data-outcome={outcome} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" className="shrink-0 overflow-visible">
      {outcome === "fail" ? (
        <polygon points={DIAMOND} fill="var(--accent-hot)" stroke="var(--accent-hot)" strokeWidth={1.5} strokeLinejoin="round" />
      ) : (
        <>
          {outcome === "unclear" && <polygon points={HALF} fill="var(--muted-foreground)" />}
          <polygon
            points={DIAMOND}
            fill="none"
            stroke={outcome === "skipped" ? "var(--muted-foreground)" : "var(--foreground)"}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeDasharray={outcome === "skipped" ? "2.5 2" : undefined}
          />
        </>
      )}
      {outcome === "pass" && <path d="M6.6 10.2 L9 12.5 L13.6 7.6" fill="none" stroke="var(--foreground)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />}
      {outcome === "fail" && <path d="M7.4 7.4 L12.6 12.6 M12.6 7.4 L7.4 12.6" fill="none" stroke="var(--on-accent-hot)" strokeWidth={1.8} strokeLinecap="round" />}
      {outcome === "unclear" && (
        <path d="M11.2 7.3 C11.2 5.9 14.6 5.9 14.6 7.9 C14.6 9.4 12.9 9.5 12.9 11.2 M12.9 13.4 L12.9 13.5" fill="none" stroke="var(--foreground)" strokeWidth={1.6} strokeLinecap="round" />
      )}
      {outcome === "skipped" && <path d="M7 10 L13 10" fill="none" stroke="var(--muted-foreground)" strokeWidth={1.6} strokeLinecap="round" />}
    </svg>
  )
}
