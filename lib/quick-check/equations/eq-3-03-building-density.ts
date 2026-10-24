// EQ-3.3: \rho_{building} = \frac{N_{total} \cdot {10}^{4}}{A_{proj}}
import { divide } from "./divide"

/**
 * EQ-3.3: building density in buildings/ha. N_total is the entered total, industry included
 * (R-02). null when the area is 0 (the schema requires an area > 0).
 */
export function buildingDensity(totalBuildings: number, projectAreaM2: number): number | null {
  return divide(totalBuildings * 10 ** 4, projectAreaM2)
}
