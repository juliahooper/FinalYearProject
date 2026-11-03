---
id: MET-05
title: Detector evaluation metrics
group: metrics
status: decided
decided_on: 2026-11-02
readings: [mendu2025safer, dixon2018measuring, de-arteaga2019bias, rottger2021hatecheck, borkan2019nuanced, vidgen2021introducing, guo2017calibration, ribeiro2020accuracy]
---

## Question
E.g. precision, recall, F1, calibration, per-category breakdown.

## Options considered
- **Option A**: classification metrics only.
- **Option B**: classification plus fairness.
- **Option C**: classification, fairness, calibration and statistics. **Chosen.**

## Decision
**Option C, classification, fairness, calibration and statistics, decided 2 November 2026.**

| Area | Metric | Reported in |
|---|---|---|
| Accuracy | Precision, recall and F1 per label; macro-F1 | Main text |
| Accuracy, threshold-free | Precision-recall AUC | Main text |
| Fairness | False-positive and false-negative rate per ground; false positive equality difference | Main text |
| Fairness | Per-group AUC metrics of Borkan et al. (2019); true-positive rate per ground (equal opportunity) | Appendix |
| Confidence | Expected calibration error with a reliability diagram, before and after temperature scaling | Main text |
| Statistics | Bootstrap 95% confidence intervals on every metric; McNemar's test or a paired bootstrap against the baseline | Main text |
| Source level | Error between planted and measured group share; detection rate by size of planted skew | Main text |
| Gap set | Accuracy per function and per ground, framed as diagnostic | Main text |
| Generalisation | Drop in macro-F1 from the held-out test split to the leave-one-dataset-out test, with confidence intervals | Main text |

**Headline result:** the false-positive rate on HateCheck's non-hateful cases and the gap set's "none" functions, for the detector versus Detoxify, with confidence intervals.

## Why
- Per-ground false-positive rates test the "mention is not bias" stance directly. The false positive equality difference (Dixon et al., 2018, @dixon2018measuring) and per-group metrics on real data (Borkan et al., 2019, @borkan2019nuanced) were designed for exactly this failure.
- Equal opportunity, equal true-positive rates across groups, checks that biased text about every ground is caught equally often.
- Biased passages are rare in real text, and ROC plots look misleadingly good on imbalanced data, so precision-recall AUC is used instead (Saito and Rehmsmeier, 2015, @saito2015precisionrecall).
- Modern neural networks are poorly calibrated, and temperature scaling fixes this well (Guo et al., 2017, @guo2017calibration). Calibrated scores are needed before setting thresholds (MET-04) or measuring ensemble disagreement (DET-05).
- Every comparison is tested for significance, with the test chosen by data type: McNemar's test for two classifiers on the same items, a paired bootstrap for differences in F1 (see Dror et al., 2018, @dror2018hitchhikers, on choosing significance tests in NLP).
- F1 keeps results comparable with related work such as Mendu et al. (2025) @mendu2025safer.

## Consequences
- Every evaluation run saves raw per-item predictions and scores, so all metrics and intervals can be recomputed without re-running the model.
- The detector needs a held-out calibration split for temperature scaling, separate from the test sets.
- MET-06 reuses these accuracy metrics to compare backends.
- EVAL-05's regression tests can assert minimum values on a fixed subset.
- The 10,000-word limit means only the headline metrics go in the main text; the rest go in an appendix table.
