---
id: EVAL-04
title: Attribution and explanation tests
group: evaluation
status: exploring
decided_on:
readings: [de-arteaga2019bias, lundberg2017unified, ribeiro2016why]
---

## Question
Whether post-hoc attribution (for example SHAP or LIME) or training-data attribution is used to link changes in the model's output to the sources the tool removed or flagged, and how the faithfulness of those explanations is checked.

## Options considered
**Preliminary study (master plan, run during the XAI module):** attribution results on 190 identity-template and 48 promote/report/counter sentences scored by both Detoxify models. SHAP (Lundberg and Lee, 2017) and LIME (Ribeiro et al., 2016) ranked identity-word effects close to counterfactual swaps (Spearman correlation at least 0.92), but SHAP overstated their size; agreement between SHAP and LIME was no better than chance at flagging wrong explanations (AUC 0.46), while weak signal strength was a useful warning (AUC 0.80).

What it suggests for EVAL-04: check attribution faithfulness against counterfactual swaps rather than trusting agreement between two attribution methods.

## Decision
(not decided yet; exploring, based on the preliminary study)

## Why
(empty until decided; cite readings by key)

## Consequences
(empty until decided)
