---
id: EQ-3.1
title: Number of Buildings per Type and Construction Period
source: [00_originals/AQC-Methodology.docx §3.1]
output: N_{i,p}
inputs: ['N_{total}', 's_{i,p}']
latex: N_{i,p} = N_{total} \cdot s_{i,p}
user_inputs: [QCT-IN-01, QCT-IN-04]
flags: [OQ-01, OQ-08]
---

# EQ-3.1 · Number of Buildings per Type and Construction Period

$$
N_{i,p} = N_{total} \cdot s_{i,p}
$$

| Symbol | Definition (verbatim) |
|---|---|
| $N_{i,p}$ | Number of buildings of type i and construction period p |
| $N_{total}$ | Total number of buildings |
| $s_{i,p}$ | Share of building type i and construction period p in % |

**User inputs:** [in-01](../01_input-project-data/in-01_total-number-of-buildings.md), [in-04](../01_input-project-data/in-04_building-type-and-period-shares.md)

**Open questions:** [OQ-01](../open-questions/OQ-01_percent-values.md), [OQ-08](../open-questions/OQ-08_symbol-and-index-overloading.md)
