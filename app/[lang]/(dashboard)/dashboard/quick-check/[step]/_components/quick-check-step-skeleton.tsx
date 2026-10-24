import { Skeleton } from "@/components/ui/skeleton"
import { GateSkeleton } from "../../../_components/gate-skeleton"

/**
 * Fallback while the step streams in after a client navigation: the page header's eyebrow,
 * title and lead lines at their final sizes, then the gate's skeleton.
 */
export function QuickCheckStepSkeleton() {
  return (
    <>
      <div aria-hidden="true" className="flex max-w-[68ch] flex-col gap-2.5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-[clamp(30px,3.24vw,41px)] w-[min(24rem,80%)]" />
        <Skeleton className="h-6 w-full sm:h-7" />
      </div>
      <GateSkeleton />
    </>
  )
}
