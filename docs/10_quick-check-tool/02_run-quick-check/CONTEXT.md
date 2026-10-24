# 02_run-quick-check

Flow step 2: *Run a Quick Check*. Methodology §3, one file per equation. File names follow the PDF section numbers (`eq-03-04a` = §3.4, first equation). [calc-00](calc-00_calculation-methodology.md) holds the §3 intro; [eq-03-07](eq-03-07_cooling-to-heating-ratio.md) has no equation in the source.

Order below is derived only from which equation outputs each equation consumes (frontmatter `inputs`/`output`). Symbols without a producing equation come from user inputs or `_reference` tables, or are open questions (e.g. `N_{ha}` → OQ-09, `Q_{cool,i,p}` → OQ-08).

| Equation | Output | Needs |
|---|---|---|
| [EQ-3.1](eq-03-01_number-of-buildings.md) | $N_{i,p}$ | inputs/tables only |
| [EQ-3.2a](eq-03-02a_annual-heating-demand.md) | $Q_{heat}$ | EQ-3.1 |
| [EQ-3.2b](eq-03-02b_annual-cooling-demand.md) | $Q_{cool}$ | EQ-3.1 |
| [EQ-3.2c](eq-03-02c_total-heating-demand.md) | $Q_{heat,total}$ | EQ-3.2a |
| [EQ-3.2d](eq-03-02d_total-cooling-demand.md) | $Q_{cool,total}$ | inputs/tables only |
| [EQ-3.3](eq-03-03_building-density.md) | $\rho_{building}$ | inputs/tables only |
| [EQ-3.4a](eq-03-04a_specific-net-length.md) | $l_{spec}$ | inputs/tables only |
| [EQ-3.4b](eq-03-04b_total-net-length.md) | $l_{total}$ | EQ-3.4a |
| [EQ-3.5](eq-03-05_heat-density.md) | $\rho_{heat}$ | EQ-3.2c, EQ-3.4b |
| [EQ-3.8a](eq-03-08a_heating-supply.md) | $Q_{heat,supply}$ | inputs/tables only |
| [EQ-3.8b](eq-03-08b_cooling-supply.md) | $Q_{cool,supply}$ | inputs/tables only |
| [EQ-3.6a](eq-03-06a_heating-coverage.md) | $C_{heat}$ | EQ-3.8a, EQ-3.2c |
| [EQ-3.6b](eq-03-06b_cooling-coverage.md) | $C_{cool}$ | EQ-3.8b, EQ-3.2d |
| [EQ-3.9a](eq-03-09a_heating-revenue.md) | $R_{heat}$ | EQ-3.1, EQ-3.2c |
| [EQ-3.9b](eq-03-09b_cooling-revenue.md) | $R_{cool}$ | EQ-3.1, EQ-3.2d |
| [EQ-3.10e](eq-03-10e_annuity-factor.md) | $a$ | inputs/tables only |
| [EQ-3.9c](eq-03-09c_overall-revenue.md) | $R_{overall}$ | EQ-3.9a, EQ-3.9b, EQ-3.10e |
| [EQ-3.10a](eq-03-10a_network-investment.md) | $C_{net}$ | EQ-3.4b |
| [EQ-3.10b](eq-03-10b_supply-investment-per-source.md) | $C_{i}$ | EQ-3.8a |
| [EQ-3.10c](eq-03-10c_supply-investment-total.md) | $C_{i,total}$ | EQ-3.10b |
| [EQ-3.10d](eq-03-10d_overall-investment.md) | $C_{overall}$ | EQ-3.10a, EQ-3.10b, EQ-3.10c |
| [EQ-3.10f](eq-03-10f_annualized-costs.md) | $C_{annual}$ | EQ-3.10d, EQ-3.10e |
| [EQ-3.11](eq-03-11_electricity-costs.md) | $C_{el}$ | EQ-3.8a, EQ-3.8b |
| [EQ-3.12](eq-03-12_operation-and-maintenance.md) | $C_{O\&M}$ | EQ-3.10d |
