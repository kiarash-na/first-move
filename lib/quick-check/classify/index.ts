/** Indicator classifications (methodology §4, TBL-7..10) and the OQ-21 economic assessment. */
export { classifyBuildingDensity, densityCategory } from "./building-density"
export { classifyChRatio } from "./ch-ratio"
export { classifyCoverage, coversAtLeast90 } from "./coverage"
export { classifyEconomic } from "./economic"
export { classifyHeatDensity, toMwhPerMeter } from "./heat-density"
export * from "./rules.config"
export { classifyByRule } from "./threshold"
