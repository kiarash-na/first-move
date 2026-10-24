---
id: EQ-3.9a
title: Annual Heating Revenue
source: [00_originals/AQC-Methodology.docx §3.9]
output: R_{heat}
inputs: ['N_{i,p}', A, 'p_{H,base}', 'Q_{heat,total}', 'p_{H,energy}']
latex: R_{heat} = \sum_{i=1}^{n} \sum_{p=1}^{m} (N_{i,p} \cdot A \cdot p_{H,base}) + Q_{heat,total} \cdot p_{H,energy}
tables: [TBL-3, TBL-6]
flags: [OQ-16]
---

# EQ-3.9a · Annual Heating Revenue

$$
R_{heat} = \sum_{i=1}^{n} \sum_{p=1}^{m} (N_{i,p} \cdot A \cdot p_{H,base}) + Q_{heat,total} \cdot p_{H,energy}
$$

| Symbol | Definition (verbatim) |
|---|---|
| $R_{heat}$ | Annual heating revenue in €/a |
| $A$ | default floor area per building type i and construction period p in m² |
| $p_{H,base}$ | heating base price in €/m² |
| $Q_{heat,total}$ | total annual heating demand of all buildings in kWh/a |
| $p_{H,energy}$ | heating energy price in €/kWh |

**Uses results of:** [EQ-3.1](eq-03-01_number-of-buildings.md), [EQ-3.2c](eq-03-02c_total-heating-demand.md)

**Data:** [Table 3](../_reference/table-03_average-floor-area.yaml), [Table 6](../_reference/table-06_economic-parameters.yaml)

**Open questions:** [OQ-16](../open-questions/OQ-16_base-price-period.md)
