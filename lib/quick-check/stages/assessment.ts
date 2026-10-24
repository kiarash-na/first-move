import { classifyBuildingDensity, densityCategory } from "../classify/building-density"
import { classifyChRatio } from "../classify/ch-ratio"
import { classifyCoverage } from "../classify/coverage"
import { classifyEconomic } from "../classify/economic"
import { classifyHeatDensity } from "../classify/heat-density"
import { keyFactors, type Drivers } from "../drivers"
import type { EngineInputs } from "../inputs"
import { overallResult, type OverallAssessment } from "../overall-rule"
import type { QuickCheckClasses, QuickCheckValues } from "../types"

export interface AssessmentStage {
  classes: QuickCheckClasses
  assessment: OverallAssessment
  drivers: Drivers
}

/** Methodology §4: the TBL-7..10 and OQ-21 classes, the TBL-11 result (OQ-22) and its drivers. */
export function assessmentStage(values: QuickCheckValues, inputs: EngineInputs): AssessmentStage {
  const buildingDensity = classifyBuildingDensity(values.buildingDensity)
  const classes: QuickCheckClasses = {
    heatingCoverage: classifyCoverage(values.heatingCoverage),
    coolingCoverage: classifyCoverage(values.coolingCoverage),
    buildingDensity,
    densityCategory: densityCategory(buildingDensity),
    heatDensity: classifyHeatDensity(values.heatDensityMwhPerM),
    chRatio: classifyChRatio(values.chRatio),
    economic: classifyEconomic(values.economicRatio),
  }
  const assessment = overallResult({
    industry: inputs.industry,
    unknownSources: inputs.unknownSources,
    coverage: { heating: classes.heatingCoverage, cooling: classes.coolingCoverage },
    buildingDensity: classes.buildingDensity,
    heatDensity: classes.heatDensity,
    economic: classes.economic,
  })
  const drivers = keyFactors({
    industry: inputs.industry,
    unknownSources: inputs.unknownSources,
    heatingCoverage: { classification: classes.heatingCoverage, value: values.heatingCoverage },
    coolingCoverage: { classification: classes.coolingCoverage, value: values.coolingCoverage },
    economics: { classification: classes.economic, value: values.economicRatio },
    heatDensity: { classification: classes.heatDensity, value: values.heatDensityMwhPerM },
    buildingDensity: { classification: classes.buildingDensity, value: values.buildingDensity },
  })
  return { classes, assessment, drivers }
}
