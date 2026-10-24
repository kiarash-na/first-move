---
id: EQ-3.9b
title: Annual Cooling Revenue
source: [00_originals/AQC-Methodology.docx §3.9]
output: R_{cool}
inputs: ['N_{i,p}', A, 'p_{C,base}', 'Q_{cool,total}', 'p_{C,energy}']
latex: R_{cool} = \sum_{i=1}^{n} \sum_{p=1}^{m} (N_{i,p} \cdot A \cdot p_{C,base}) + Q_{cool,total} \cdot p_{C,energy}
tables: [TBL-3, TBL-6]
flags: [OQ-15, OQ-16]
---

# EQ-3.9b · Annual Cooling Revenue

$$
R_{cool} = \sum_{i=1}^{n} \sum_{p=1}^{m} (N_{i,p} \cdot A \cdot p_{C,base}) + Q_{cool,total} \cdot p_{C,energy}
$$

| Symbol | Definition (verbatim) |
|---|---|
| $R_{cool}$ | Annual cooling revenue in €/a |
| $A$ | default floor area per building type i and construction period p in m² |
| $p_{C,base}$ | cooling base price in €/m² |
| $Q_{cool,total}$ | total annual cooling demand of all buildings in kWh/a |
| $p_{HC,energy}$ | cooling energy price in €/kWh |

**Uses results of:** [EQ-3.1](eq-03-01_number-of-buildings.md), [EQ-3.2d](eq-03-02d_total-cooling-demand.md)

**Data:** [Table 3](../_reference/table-03_average-floor-area.yaml), [Table 6](../_reference/table-06_economic-parameters.yaml)

**Open questions:** [OQ-15](../open-questions/OQ-15_cooling-energy-price-symbol.md), [OQ-16](../open-questions/OQ-16_base-price-period.md)
