---
id: MET-02
title: Per-item bias score
group: metrics
status: decided
decided_on: 2026-11-02
readings: [guo2017calibration]
---

## Question
What is scored and on what scale.

## Options considered
- **Option A**: a yes/no flag per passage. Rejected: it loses thresholds, PR-AUC, calibration and ensemble disagreement.
- **Option B**: a calibrated probability per harm label, plus a context-type output head. **Chosen.**
- Severity-weighted scores and multiplying by a separate "expresses" probability were also rejected (see Why).

## Decision
**Option B, calibrated probability per harm label, plus a context-type output head, decided 2 November 2026.**

1. The detector outputs an independent probability from 0 to 1 for stereotyping and for demeaning (one sigmoid per label, since a passage can be both).
2. Each probability is calibrated separately with its own temperature on a held-out calibration split: the calibrated score is $\sigma(z/T)$, with one $T$ for stereotyping and one for demeaning, each fitted by minimising negative log-likelihood. This is the per-sigmoid form of temperature scaling, not the multiclass softmax version.
3. The passage score is the higher of the two calibrated probabilities; both are kept for the report.
4. A second output head predicts the context type (expresses, mentions, discusses, quotes or counters). It is not part of the score; it is used in the report and for false-positive analysis by context type.
5. The score is worded as "detector confidence that the passage expresses stereotyping or demeaning language", never as a level or severity of bias.

## Why
- A probability keeps everything later decisions need: adjustable thresholds (MET-04), precision-recall AUC and calibration (MET-05), and ensemble disagreement (DET-05). A yes/no flag would lose all of these.
- Raw neural network probabilities are poorly calibrated; temperature scaling makes the 0 to 1 number trustworthy (Guo et al., 2017, @guo2017calibration). Guo et al. describe it for a single softmax over classes; the two harm labels here are independent sigmoids, so each gets its own temperature (the binary equivalent, a one-parameter Platt scaling). Temperature scaling does not change which side of 0.5 a score falls, so it leaves F1 and PR-AUC unchanged and only affects thresholds and calibration error.
- Calibration is only guaranteed on data like the calibration split (Guo et al. assume the same distribution), so calibration error is also reported on the out-of-distribution test sets.
- Taking the maximum over parts follows established practice: Mendu et al. (2025) @mendu2025safer scored chunks with Perspective API and took the maximum, and Perspective itself reports probabilities. A passage is only as safe as its worst harm.
- Severity weights were rejected: they are value judgements with no data behind them, and a weighted score is no longer a calibrated probability.
- The "mention is not bias" stance is built into the harm labels themselves, which are trained so that mentions, discussion and quotes are none. Multiplying by a separate "expresses" probability was rejected because the product of two calibrated numbers is not calibrated.

## Consequences
- DET-03: the model is trained multi-task, with two sigmoid harm outputs and a four-way context-type output.
- MET-03 combines passage scores into a source score; severity, if needed, comes in there, for example as the share of passages above a threshold.
- UI-01 and UI-02 must use the confidence wording above.
- MET-05's calibration error is measured on these calibrated probabilities.
