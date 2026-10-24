---
id: EQ-3.2c
title: Total Annual Heating Demand
source: [00_originals/AQC-Methodology.docx §3.2]
output: Q_{heat,total}
inputs: ['Q_{heat}']
latex: Q_{heat,total} = \sum_{i=1}^{n} \sum_{p=1}^{m} Q_{heat}
flags: [OQ-08]
---

# EQ-3.2c · Total Annual Heating Demand

> The total annual heating and cooling demand is obtained by summing the demand across all building types and construction periods. These totals represent the estimated annual energy demand of the entire project area.

$$
Q_{heat,total} = \sum_{i=1}^{n} \sum_{p=1}^{m} Q_{heat}
$$

| Symbol | Definition (verbatim) |
|---|---|
| $Q_{heat,total}$ | total annual heating demand of all buildings in kWh/a |
| $n$ | number of building types |
| $m$ | number of construction periods |

**Uses results of:** [EQ-3.2a](eq-03-02a_annual-heating-demand.md)

**Open questions:** [OQ-08](../open-questions/OQ-08_symbol-and-index-overloading.md)
