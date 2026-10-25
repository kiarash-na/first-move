// @vitest-environment node
import { describe, expect, it } from "vitest"
import { EXAMPLE_DATE, localizeExample } from "./localize"
import { ruralVillageHotel } from "./rural-village-hotel"
import { text, type ExampleDefinition } from "./types"

describe("localizeExample", () => {
  it("returns a project with the fixed example date and a placeholder id", () => {
    const project = localizeExample(ruralVillageHotel, "en")
    expect(project.meta.createdAt).toBe(EXAMPLE_DATE.toISOString())
    expect(project.meta.updatedAt).toBe(EXAMPLE_DATE.toISOString())
    expect(project.meta.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(project.meta.exampleId).toBe("rural-village-hotel")
  })

  it("uses German text where it exists and English elsewhere (D-32)", () => {
    const example: ExampleDefinition = {
      ...ruralVillageHotel,
      name: text("Rural village", "Dorf"),
      summary: text("Summary"),
    }
    expect(localizeExample(example, "de").meta.name).toBe("Dorf")
    expect(localizeExample(example, "en").meta.name).toBe("Rural village")
    expect(localizeExample(ruralVillageHotel, "de").meta.name).toBe(ruralVillageHotel.name.en)
  })

  it("stores the shares in percent and leaves the other cells empty", () => {
    const { shares } = localizeExample(ruralVillageHotel, "en").buildings
    expect(shares.residential["1961_1990"]).toBe(30)
    expect(shares.residential.until_1919).toBe(10)
    expect(shares.industry.until_1919).toBeNull()
  })

  it("selects only the listed sources and keeps the known network length", () => {
    const project = localizeExample(ruralVillageHotel, "en")
    expect(project.sources.potentials.ambient_air).toBe("low")
    expect(project.sources.potentials.geothermal).toBeNull()
    expect(project.quickCheck.networkLengthM).toBe(7_000)
  })

  it("leaves the demand estimated unless the example states it (QCT-IN-05)", () => {
    expect(localizeExample(ruralVillageHotel, "en").quickCheck.manualDemand).toEqual({ heatingKwhPerYear: null, coolingKwhPerYear: null })
    const stated: ExampleDefinition = { ...ruralVillageHotel, manualDemand: { heatingKwhPerYear: 207_000, coolingKwhPerYear: null } }
    expect(localizeExample(stated, "de").quickCheck.manualDemand).toEqual({ heatingKwhPerYear: 207_000, coolingKwhPerYear: null })
  })

  it("throws for an example the schema rejects, naming it", () => {
    const broken: ExampleDefinition = { ...ruralVillageHotel, buildings: { ...ruralVillageHotel.buildings, total: -1 } }
    expect(() => localizeExample(broken, "en")).toThrow(/rural-village-hotel/)
  })
})
