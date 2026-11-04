---
id: MET-06
title: Backend comparison metrics
group: metrics
status: decided
decided_on: 2026-11-03
readings: [saito2015precisionrecall, dror2018hitchhikers, zafrir2019q8bert, warner2025smarter]
---

## Question
Accuracy, cost per 1,000 items, latency, privacy.

## Options considered
- **Option A**: accuracy only.
- **Option B**: accuracy, cost, latency, privacy and review burden. **Chosen.**
- Energy and carbon were left out (see Why).

## Decision
**Option B, accuracy, cost, latency, privacy and review burden, decided 3 November 2026.**

Setups compared: local model only, API only, and the cascade ensemble in both combination modes (average and maximum); three API providers if the DET-04 stretch goal is reached.

| Dimension | Measure | Unit |
|---|---|---|
| Accuracy | The MET-05 headline set: macro-F1, precision-recall AUC, per-ground false-positive rate, calibration error | As in MET-05 |
| Cost | API: tokens used times the listed price on a stated date. Local: compute time times a stated hourly hardware rate, labelled as an estimate | Euro per 1,000 passages |
| Latency | Median and 95th-percentile time per passage, and total time for a 1,000-passage source, on a CPU-only CI runner (and on GPU for reference) | Seconds |
| Privacy | Share of passages that leave the machine (0% local, 100% API, measured for the cascade) and whether the provider offers no data retention | % and yes/no |
| Review burden | Review rate from DET-05 | % of passages |

**Presentation:** one comparison table with a row per setup, and one trade-off chart of cost per 1,000 passages against macro-F1 with a point per setup.

## Why
- Accuracy alone would hide the trade-offs that decide whether a backend is usable.
- Cost and latency decide whether the gate is usable in ordinary CI.
- Accuracy against cost is a trade-off, and the chart shows where the cascade sits on it.
- Privacy is reported as a factual property rather than an invented score.
- Energy and carbon were left out: API providers do not publish per-request energy, so the comparison would be one-sided.

## Consequences
- Every benchmark run records hardware, passage-length distribution, API model version and the pricing date, so costs can be reproduced.
- Latency is measured on a CPU-only runner, matching the claim that the tool runs in ordinary CI (CI-03).
- The DET-04 adapter reports tokens used per run; the cascade reports how many passages it sent to the API.
