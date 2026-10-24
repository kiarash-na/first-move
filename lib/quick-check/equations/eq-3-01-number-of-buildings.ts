// EQ-3.1: N_{i,p} = N_{total} \cdot s_{i,p}

/**
 * EQ-3.1: buildings of type i and construction period p. `share` is a fraction (the % input
 * divided by 100, OQ-01); the result stays fractional and is rounded for display only.
 */
export function numberOfBuildings(totalBuildings: number, share: number): number {
  return totalBuildings * share
}
