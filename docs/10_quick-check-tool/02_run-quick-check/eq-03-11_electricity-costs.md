---
id: EQ-3.11
title: 'Operational Costs: electricity'
source: [00_originals/AQC-Methodology.docx §3.11]
output: C_{el}
inputs: ['Q_{heat,supply}', 'COP_{H}', 'Q_{cool,supply}', 'COP_{C}', 'c_{el}']
latex: C_{el} = \sum_{i=1}^{n} \frac{Q_{heat,supply}}{COP_{H}} \cdot c_{el} + \sum_{i=1}^{n} \frac{Q_{cool,supply}}{COP_{C}} \cdot c_{el}
tables: [TBL-4, TBL-5, TBL-6]
user_inputs: [QCT-IN-09]
flags: [OQ-06, OQ-08, OQ-11, OQ-13, OQ-14, OQ-19]
---

# EQ-3.11 · Operational Costs: electricity

$$
C_{el} = \sum_{i=1}^{n} \frac{Q_{heat,supply}}{COP_{H}} \cdot c_{el} + \sum_{i=1}^{n} \frac{Q_{cool,supply}}{COP_{C}} \cdot c_{el}
$$

| Symbol | Definition (verbatim) |
|---|---|
| $C_{el}$ | total costs for electricity of heat pumps in kWh/a |
| $Q_{heat,supply}$ | annual heating supply per source in kWh/a |
| $Q_{cool,supply}$ | annual cooling supply per source in kWh/a |
| $COP$ | Coefficient of power of heat pump per source |
| $c_{el}$ | specific electricity costs in €/kWh |

> Consider a cost reduction, when PV is available.

**Uses results of:** [EQ-3.8a](eq-03-08a_heating-supply.md), [EQ-3.8b](eq-03-08b_cooling-supply.md)

**Data:** [Table 4](../_reference/table-04_heating-capacity-per-source.yaml), [Table 5](../_reference/table-05_cooling-capacity-per-source.yaml), [Table 6](../_reference/table-06_economic-parameters.yaml)

**User inputs:** [in-09](../01_input-project-data/in-09_pv-availability.md)

**Open questions:** [OQ-06](../open-questions/OQ-06_pv-input-and-reduction.md), [OQ-08](../open-questions/OQ-08_symbol-and-index-overloading.md), [OQ-11](../open-questions/OQ-11_coverage-supply-aggregation.md), [OQ-13](../open-questions/OQ-13_missing-cop-and-capacity.md), [OQ-14](../open-questions/OQ-14_cop-naming.md), [OQ-19](../open-questions/OQ-19_c-el-unit.md)
