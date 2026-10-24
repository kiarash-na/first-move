import type { DriverEffect, DriverId, Drivers } from "@/lib/quick-check"

/**
 * Whether an indicator supports or limits the result, read from the engine's drivers
 * (QCT-KF-05), or null when it is not a driver (a demand that is not relevant).
 */
export function indicatorEffect(drivers: Drivers, id: DriverId): DriverEffect | null {
  if (drivers.supporting.some((driver) => driver.id === id)) return "supporting"
  if (drivers.limiting.some((driver) => driver.id === id)) return "limiting"
  return null
}
