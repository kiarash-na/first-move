---
id: EQ-3.2b
title: Annual Cooling Demand
source: [00_originals/AQC-Methodology.docx §3.2]
output: Q_{cool}
inputs: ['N_{i,p}', 'q_{cool}', A]
latex: Q_{cool} = N_{i,p} \cdot q_{cool} \cdot A
tables: [TBL-2, TBL-3]
flags: [OQ-08]
---

# EQ-3.2b · Annual Cooling Demand

$$
Q_{cool} = N_{i,p} \cdot q_{cool} \cdot A
$$

| Symbol | Definition (verbatim) |
|---|---|
| $Q_{cool}$ | Annual cooling demand for building type i and construction period p in kWh/a |
| $N_{i,p}$ | Number of buildings of type i and construction period p |
| $q_{cool}$ | default cooling demand per building type i and construction period p in kWh/m² |
| $A$ | default floor area per building type i and construction period p in m² |

**Uses results of:** [EQ-3.1](eq-03-01_number-of-buildings.md)

**Data:** [Table 2](../_reference/table-02_annual-cooling-demand.yaml), [Table 3](../_reference/table-03_average-floor-area.yaml)

**Open questions:** [OQ-08](../open-questions/OQ-08_symbol-and-index-overloading.md)
