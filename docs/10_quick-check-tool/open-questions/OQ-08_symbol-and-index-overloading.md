---
id: OQ-08
title: Overloaded symbols and inconsistent indices
status: open
answer: null
---

# OQ-08 · Overloaded symbols and inconsistent indices

**Observation:** i = building type / interest rate / source (C_i, Σ in §3.11); p = construction period / depreciation period; n = number of building types / number of sources; A = floor area vs A_proj. Q_heat and Q_cool carry no i,p index while the cooling sum uses Q_cool,i,p. C_i,total sums over j but the summand is C_i.

**Source quotes:**

- EQ-3.2a: $Q_{heat} = N_{i,p} \cdot q_{heat} \cdot A$
- EQ-3.2d: $Q_{cool,total} = \sum_{i=1}^{n} \sum_{p=1}^{m} Q_{cool,i,p}$
- EQ-3.10c: $C_{i,total} = \sum_{j=1}^{n} C_{i}$
- EQ-3.10e: $a = \frac{{(1 + i)}^{p} \cdot i}{{(1 + i)}^{p} - 1}$
- EQ-3.11: $C_{el} = \sum_{i=1}^{n} \frac{Q_{heat,supply}}{COP_{H}} \cdot c_{el} + \sum_{i=1}^{n} \frac{Q_{cool,supply}}{COP_{C}} \cdot c_{el}$
- EQ-3.2c glossary: $n$ … number of building types
- EQ-3.10c glossary: $n$ … number of sources

**Referenced by:** [eq-03-01_number-of-buildings](../02_run-quick-check/eq-03-01_number-of-buildings.md), [eq-03-02a_annual-heating-demand](../02_run-quick-check/eq-03-02a_annual-heating-demand.md), [eq-03-02b_annual-cooling-demand](../02_run-quick-check/eq-03-02b_annual-cooling-demand.md), [eq-03-02c_total-heating-demand](../02_run-quick-check/eq-03-02c_total-heating-demand.md), [eq-03-02d_total-cooling-demand](../02_run-quick-check/eq-03-02d_total-cooling-demand.md), [eq-03-10b_supply-investment-per-source](../02_run-quick-check/eq-03-10b_supply-investment-per-source.md), [eq-03-10c_supply-investment-total](../02_run-quick-check/eq-03-10c_supply-investment-total.md), [eq-03-10e_annuity-factor](../02_run-quick-check/eq-03-10e_annuity-factor.md), [eq-03-11_electricity-costs](../02_run-quick-check/eq-03-11_electricity-costs.md)
