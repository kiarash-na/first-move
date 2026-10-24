---
id: EQ-3.9c
title: Overall Revenues
source: [00_originals/AQC-Methodology.docx §3.9]
output: R_{overall}
inputs: ['R_{heat}', 'R_{cool}', 'p_{connect}', 'N_{total}', a]
latex: R_{overall} = R_{heat} + R_{cool} + p_{connect} \cdot N_{total} \cdot a
tables: [TBL-6]
user_inputs: [QCT-IN-01]
---

# EQ-3.9c · Overall Revenues

$$
R_{overall} = R_{heat} + R_{cool} + p_{connect} \cdot N_{total} \cdot a
$$

| Symbol | Definition (verbatim) |
|---|---|
| $R_{overall}$ | overall revenues of the system in €/a |
| $R_{heat}$ | annual heating revenue in €/a |
| $R_{cool}$ | annual cooling revenue in €/a |
| $p_{connect}$ | connection fee per building in €/building |
| $N_{total}$ | total number of buildings |
| $a$ | annuity factor |

**Uses results of:** [EQ-3.9a](eq-03-09a_heating-revenue.md), [EQ-3.9b](eq-03-09b_cooling-revenue.md), [EQ-3.10e](eq-03-10e_annuity-factor.md)

**Data:** [Table 6](../_reference/table-06_economic-parameters.yaml)

**User inputs:** [in-01](../01_input-project-data/in-01_total-number-of-buildings.md)
