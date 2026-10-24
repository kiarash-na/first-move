---
id: EQ-3.8b
title: Cooling Supply
source: [00_originals/AQC-Methodology.docx §3.8]
output: Q_{cool,supply}
inputs: ['Q_{cool,available}', COP]
latex: Q_{cool,supply} = Q_{cool,available} \cdot \frac{COP}{COP + 1}
tables: [TBL-5]
user_inputs: [QCT-IN-06, QCT-IN-07]
flags: [OQ-11, OQ-13, OQ-14]
---

# EQ-3.8b · Cooling Supply

$$
Q_{cool,supply} = Q_{cool,available} \cdot \frac{COP}{COP + 1}
$$

| Symbol | Definition (verbatim) |
|---|---|
| $Q_{cool,supply}$ | annual cooling supply per source in kWh/a |
| $Q_{cool,available}$ | total cooling energy provided by sources in kWh/a |
| $COP$ | Coefficient of power of heat pump per source |

**Data:** [Table 5](../_reference/table-05_cooling-capacity-per-source.yaml)

**User inputs:** [in-06](../01_input-project-data/in-06_energy-source-selection.md), [in-07](../01_input-project-data/in-07_source-potential-level.md)

**Open questions:** [OQ-11](../open-questions/OQ-11_coverage-supply-aggregation.md), [OQ-13](../open-questions/OQ-13_missing-cop-and-capacity.md), [OQ-14](../open-questions/OQ-14_cop-naming.md)
