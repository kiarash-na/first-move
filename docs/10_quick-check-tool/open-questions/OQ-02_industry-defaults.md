---
id: OQ-02
title: No default values for industry
status: resolved
answer: 'Industry is selectable in the share grid. Any industry share > 0 forces ''Further analysis required'' (QCT-RULE-INDUSTRY). Industry adds no demand, floor area or base/energy-price revenue (no defaults). Terms based on N_total (EQ-3.3, 3.9c, 3.10d) use the entered total, industry included. The UI shows a note. (owner, 2026-10-24; NOTE-2026-10-24-owner-decisions)'
---

# OQ-02 · No default values for industry

**Observation:** Tables 1–3 contain "-" for "Industry*"; the asterisk has no footnote of its own. How an industry share enters the calculations is not stated (only the forced result).

**Source quotes:**

- Tables 1–3: `Industry* | - | - | - | - | -`
- §1.2: "The provided tables do not include default values for industrial buildings. If industry is included in the project area, the overall assessment shall automatically be set to “Further analysis required”."

**Referenced by:** [in-04_building-type-and-period-shares](../01_input-project-data/in-04_building-type-and-period-shares.md), [rule-forced_industry](../03_receive-assessment/rule-forced_industry.md), [ref-1-2_default-building-parameters](../_reference/ref-1-2_default-building-parameters.md)
