---
id: UI-02
title: Explanation of flagged items
group: reporting
status: exploring
decided_on:
readings: [de-arteaga2019bias, sap2020social, kirk2022handling]
---

## Question
How each flag is explained (highlighted span, category, reason).

## Options considered
**Preliminary study (master plan, run during the XAI module):** attribution results on 190 identity-template and 48 promote/report/counter sentences scored by both Detoxify models. SHAP (Lundberg and Lee, 2017) and LIME (Ribeiro et al., 2016) ranked identity-word effects close to counterfactual swaps (Spearman correlation at least 0.92), but SHAP overstated their size; agreement between SHAP and LIME was no better than chance at flagging wrong explanations (AUC 0.46), while weak signal strength was a useful warning (AUC 0.80).

What it suggests: the report should **highlight spans rather than precise effect sizes**, and treat attributions as triage.

## Decision
(not decided yet; exploring, based on the preliminary study)

## Why
(empty until decided; cite readings by key)

## Consequences
(empty until decided)
