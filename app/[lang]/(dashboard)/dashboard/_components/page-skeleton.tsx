import { Skeleton } from "@/components/ui/skeleton"

/** Shown while the project store loads (client data only after mount, PLAN-DASH-04). */
export function PageSkeleton({ label }: { label?: string }) {
  return (
    <div data-slot="page-skeleton" aria-busy="true" aria-label={label} className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-[min(28rem,80%)]" />
        <Skeleton className="h-4 w-[min(36rem,90%)]" />
      </div>
      <div className="grid gap-px border bg-border sm:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div key={key} className="flex flex-col gap-3 bg-background p-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>
      <Skeleton className="h-56 w-full" />
    </div>
  )
}
