---
id: OQ-13
title: Sources without COP or capacity
status: resolved
answer: 'Solar thermal (no COP): Q_heat,supply = Q_heat,available, no heat-pump electricity. Sources without cooling capacity (waste heat, solar thermal): Q_cool,supply = 0. (owner, 2026-10-24; NOTE-2026-10-24-owner-decisions)'
---

# OQ-13 · Sources without COP or capacity

**Observation:** Solar thermal has COP "-" (Table 4) and no cooling capacity; waste heat has no cooling capacity (Table 5). EQ-3.8a/b and EQ-3.11 divide by / multiply with COP.

**Source quotes:**

- Table 4: `Solar thermal | 5,000 | 20,000 | 50,000 | -`
- Table 5: `Waste heat | - | - | - | -`
- Table 5: `Solar thermal | - | - | - | -`
- EQ-3.8a: $Q_{heat,supply} = Q_{heat,available} \cdot \frac{COP}{COP - 1}$
- EQ-3.11: $C_{el} = \sum_{i=1}^{n} \frac{Q_{heat,supply}}{COP_{H}} \cdot c_{el} + \sum_{i=1}^{n} \frac{Q_{cool,supply}}{COP_{C}} \cdot c_{el}$

**Referenced by:** [in-07_source-potential-level](../01_input-project-data/in-07_source-potential-level.md), [eq-03-08a_heating-supply](../02_run-quick-check/eq-03-08a_heating-supply.md), [eq-03-08b_cooling-supply](../02_run-quick-check/eq-03-08b_cooling-supply.md), [eq-03-11_electricity-costs](../02_run-quick-check/eq-03-11_electricity-costs.md), [ref-1-3_default-energy-source-parameters](../_reference/ref-1-3_default-energy-source-parameters.md)
