import { z } from "zod"
import { longText, shortText, textList } from "./common"

/**
 * The site or district (BM-STEP-01, BM-SCN-01..04). Free text, stored as typed. Each stated
 * scenario field has a home here, so a preset prefills only those (OQ-25).
 */
export const siteSchema = z
  .strictObject({
    name: shortText().meta({ description: "Name of the site or district." }),
    location: shortText().meta({ description: "Where it is: municipality, region, country." }),
    siteType: shortText().meta({
      description: "Kind of site, e.g. rural village or urban outskirts (BM-SCN Location). Not the OQ-04 density category.",
    }),
    ownership: longText().meta({ description: "Property and usage types, ownership structure (BM-SCN)." }),
    units: shortText().meta({
      description: "Units or buildings as stated, e.g. '20-70 units (phased)' (BM-SCN). The Quick Check count is buildings.total.",
    }),
    currentSupply: textList().meta({ description: "Current energy supply, one entry per carrier (BM-SCN)." }),
    stakeholders: textList().meta({ description: "Stakeholders on site, one per entry (BM-SCN)." }),
    partners: textList().meta({ description: "Other partners, one per entry (BM-SCN)." }),
  })
  .meta({ description: "Site or district, shared by both modules (BM-STEP-01)." })

export type Site = z.infer<typeof siteSchema>
