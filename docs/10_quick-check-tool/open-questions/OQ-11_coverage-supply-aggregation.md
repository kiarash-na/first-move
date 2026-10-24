---
id: OQ-11
title: Per-source supply vs total supply in coverage
status: resolved
answer: 'Several sources may be selected. Coverage uses the sum of the per-source supplies. C_i and C_el are computed per source and summed. (owner, 2026-10-24; NOTE-2026-10-24-owner-decisions)'
---

# OQ-11 · Per-source supply vs total supply in coverage

**Observation:** C_heat/C_cool divide Q_supply ("annual ... supply per source") by the total demand. Q_available is glossed "total ... energy provided by sources". How several selected sources are combined is not stated.

**Source quotes:**

- EQ-3.6a glossary: $Q_{heat,supply}$ … annual heating supply per source in kWh/a
- EQ-3.8a glossary: $Q_{heat,available}$ … total heating energy provided by sources in kWh/a
- EQ-3.11: $C_{el} = \sum_{i=1}^{n} \frac{Q_{heat,supply}}{COP_{H}} \cdot c_{el} + \sum_{i=1}^{n} \frac{Q_{cool,supply}}{COP_{C}} \cdot c_{el}$

**Referenced by:** [in-06_energy-source-selection](../01_input-project-data/in-06_energy-source-selection.md), [eq-03-06a_heating-coverage](../02_run-quick-check/eq-03-06a_heating-coverage.md), [eq-03-06b_cooling-coverage](../02_run-quick-check/eq-03-06b_cooling-coverage.md), [eq-03-08a_heating-supply](../02_run-quick-check/eq-03-08a_heating-supply.md), [eq-03-08b_cooling-supply](../02_run-quick-check/eq-03-08b_cooling-supply.md), [eq-03-10b_supply-investment-per-source](../02_run-quick-check/eq-03-10b_supply-investment-per-source.md), [eq-03-11_electricity-costs](../02_run-quick-check/eq-03-11_electricity-costs.md)
