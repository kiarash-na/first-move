---
id: EQ-3.2a
title: Annual Heating Demand
source: [00_originals/AQC-Methodology.docx §3.2]
output: Q_{heat}
inputs: ['N_{i,p}', 'q_{heat}', A]
latex: Q_{heat} = N_{i,p} \cdot q_{heat} \cdot A
tables: [TBL-1, TBL-3]
flags: [OQ-08]
---

# EQ-3.2a · Annual Heating Demand

> The annual heating demand for each building category is calculated using the estimated number of buildings, the default heating demand per square meter and the average floor area.

$$
Q_{heat} = N_{i,p} \cdot q_{heat} \cdot A
$$

| Symbol | Definition (verbatim) |
|---|---|
| $Q_{heat}$ | Annual heating demand for building type i and construction period p in kWh/a |
| $N_{i,p}$ | Number of buildings of type i and construction period p |
| $q_{heat}$ | default heating demand per building type i and construction period p in kWh/m² |
| $A$ | default floor area per building type i and construction period p in m² |

**Uses results of:** [EQ-3.1](eq-03-01_number-of-buildings.md)

**Data:** [Table 1](../_reference/table-01_annual-heating-demand.yaml), [Table 3](../_reference/table-03_average-floor-area.yaml)

**Open questions:** [OQ-08](../open-questions/OQ-08_symbol-and-index-overloading.md)
