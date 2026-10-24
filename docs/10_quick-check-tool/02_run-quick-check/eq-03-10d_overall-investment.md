---
id: EQ-3.10d
title: 'Investment Costs: overall'
source: [00_originals/AQC-Methodology.docx §3.10]
output: C_{overall}
inputs: ['C_{HP}', 'N_{total}', 'C_{net}', 'C_{i}', 'C_{i,total}']
latex: C_{overall} = C_{HP} \cdot N_{total} + C_{net} + C_{i} + C_{i,total}
tables: [TBL-6]
user_inputs: [QCT-IN-01]
flags: [OQ-17]
---

# EQ-3.10d · Investment Costs: overall

$$
C_{overall} = C_{HP} \cdot N_{total} + C_{net} + C_{i} + C_{i,total}
$$

| Symbol | Definition (verbatim) |
|---|---|
| $C_{overall}$ | overall investment costs of the system in € |
| $C_{HP}$ | investment costs of a heat pump in € |
| $C_{net}$ | total investment cost for the network in € |
| $C_{i}$ | total investment costs per heat supply in € |
| $C_{i,total}$ | total investment for total heat supply in € |

**Uses results of:** [EQ-3.10a](eq-03-10a_network-investment.md), [EQ-3.10b](eq-03-10b_supply-investment-per-source.md), [EQ-3.10c](eq-03-10c_supply-investment-total.md)

**Data:** [Table 6](../_reference/table-06_economic-parameters.yaml)

**User inputs:** [in-01](../01_input-project-data/in-01_total-number-of-buildings.md)

**Open questions:** [OQ-17](../open-questions/OQ-17_c-overall-double-count.md)
