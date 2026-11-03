---
id: DET-05
title: Ensemble mode
group: detector
status: decided
decided_on: 2026-11-03
readings: []
---

## Question
How backends are combined, and what counts as a disagreement that's sent for human review.

## Options considered
Only the chosen option is recorded in the master plan; alternatives that were rejected are noted under Why.

## Decision
**A cascade with configurable combination and two disagreement rules, decided 3 November 2026.**

| Part | Decision |
|---|---|
| When the API runs | Cascade: the local model scores every passage; only passages in an uncertain band (default 0.3 to 0.7 calibrated score) are sent to the API. Passages outside the band are decided by the local model alone. A separate full-API run is used for evaluation. |
| Combining scores | Configurable: the average of the two calibrated probabilities (default) or the maximum, for users who need a more conservative gate. |
| Disagreement | Either rule sends a passage to review: (1) one backend is above the flag threshold and the other below; (2) the two probabilities differ by more than a set gap (default 0.4). |
| Review | A "review" outcome separate from accept and reject. Review passages are listed first in the report with both scores and explanations; nothing is silently accepted. Pipeline behaviour for review is decided in CI-02. |
| Optional | The ensemble is a configuration choice; local-only mode works fully on its own. |

## Why
- The cascade keeps confident passages on the user's machine, in line with the local-first decision (ETH-02), and cuts API cost, since only uncertain passages are sent.
- Averaging is simple and possible because both backends output calibrated probabilities (DET-04; Guo et al., 2017, @guo2017calibration). The maximum is offered as an option because it is more conservative, at the cost of inheriting both backends' false positives.
- Two disagreement rules catch both a split decision and a large confidence gap where the decisions happen to agree.
- Passing uncertain cases to a person trades coverage (the share decided automatically) against error on the rest, which the review rate makes visible.

## Consequences
- MET-05 and MET-06 report the review rate (the share of passages sent to a person) alongside accuracy, framed as coverage against risk.
- Both combination modes are evaluated from the same saved scores, so the cost in false positives of the conservative mode is reported.
- MET-04 tunes the uncertain band, the flag threshold and the disagreement gap.
- ARCH-07 holds the ensemble on/off switch, the combination mode, the band and the gap.
- Every report states how many passages were sent to the external API.
