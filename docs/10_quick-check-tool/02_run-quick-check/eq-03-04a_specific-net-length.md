---
id: EQ-3.4a
title: 'Estimated Network Length: specific net length'
source: [00_originals/AQC-Methodology.docx §3.4]
output: l_{spec}
inputs: ['N_{ha}']
latex: l_{spec} = \frac{171.22}{1 + 8.817 \cdot e^{-0.549 \cdot N_{ha}}}
flags: [OQ-09]
---

# EQ-3.4a · Estimated Network Length: specific net length

> If no network length is entered manually, the tool estimates the required network length using the following predefined relationship:

$$
l_{spec} = \frac{171.22}{1 + 8.817 \cdot e^{-0.549 \cdot N_{ha}}}
$$

| Symbol | Definition (verbatim) |
|---|---|
| $l_{spec}$ | specific net length |
| $N_{ha}$ | number of buildings per hectare |

**Open questions:** [OQ-09](../open-questions/OQ-09_n-ha-vs-rho-building.md)
