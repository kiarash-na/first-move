---
id: EQ-3.3
title: Building Density
source: [00_originals/AQC-Methodology.docx §3.3]
output: \rho_{building}
inputs: ['N_{total}', 'A_{proj}']
latex: \rho_{building} = \frac{N_{total} \cdot {10}^{4}}{A_{proj}}
user_inputs: [QCT-IN-01, QCT-IN-02, QCT-IN-03]
flags: [OQ-09]
---

# EQ-3.3 · Building Density

> Building density describes how many buildings are located within one hectare of the project area.

$$
\rho_{building} = \frac{N_{total} \cdot {10}^{4}}{A_{proj}}
$$

| Symbol | Definition (verbatim) |
|---|---|
| $\rho_{building}$ | building density of project area in buildings/ha |
| $N_{total}$ | Total number of buildings |
| $A_{proj}$ | total project area in m² |

**User inputs:** [in-01](../01_input-project-data/in-01_total-number-of-buildings.md), [in-02](../01_input-project-data/in-02_total-project-area.md), [in-03](../01_input-project-data/in-03_building-density-category.md)

**Open questions:** [OQ-09](../open-questions/OQ-09_n-ha-vs-rho-building.md)
