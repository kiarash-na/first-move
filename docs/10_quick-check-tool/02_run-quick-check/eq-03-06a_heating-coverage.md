---
id: EQ-3.6a
title: Heating Supply Coverage
source: [00_originals/AQC-Methodology.docx §3.6]
output: C_{heat}
inputs: ['Q_{heat,supply}', 'Q_{heat,total}']
latex: C_{heat} = \frac{Q_{heat,supply}}{Q_{heat,total}}
flags: [OQ-11]
---

# EQ-3.6a · Heating Supply Coverage

> The tool compares the available energy supply with the corresponding annual demand. Coverage values indicate the proportion of the annual demand that can be supplied by the selected energy sources. A value of 1.0 corresponds to 100% coverage.

$$
C_{heat} = \frac{Q_{heat,supply}}{Q_{heat,total}}
$$

| Symbol | Definition (verbatim) |
|---|---|
| $C_{heat}$ | heating demand coverage |
| $Q_{heat,supply}$ | annual heating supply per source in kWh/a |
| $Q_{heat,total}$ | total annual heating demand of all buildings in kWh/a |

**Uses results of:** [EQ-3.8a](eq-03-08a_heating-supply.md), [EQ-3.2c](eq-03-02c_total-heating-demand.md)

**Open questions:** [OQ-11](../open-questions/OQ-11_coverage-supply-aggregation.md)
