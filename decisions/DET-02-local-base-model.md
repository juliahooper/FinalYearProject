---
id: DET-02
title: Local base model
group: detector
status: decided
decided_on: 2026-11-02
readings: [mendu2025safer, zafrir2019q8bert, warner2025smarter]
---

## Question
Which small open-weight model to fine-tune, and why.

## Options considered
- **ModernBERT-base** (150M parameters, 8,192 tokens, Apache-2.0): the detector. **Chosen.**
- **HateBERT** (110M, 512 tokens, Apache-2.0): kept as an extra baseline, fine-tuned on the same data.
- **DeBERTa-v3-base** (184M, 512 tokens, MIT): stretch goal, a second detector to check results are not one model's quirk.
- **A generative LLM**: rejected for the local backend (about 7 to 20 times larger, needs a GPU); a better fit as the commercial backend (DET-04).

## Decision
**ModernBERT-base, kept lightweight, decided 2 November 2026.**

| Model | Role | Parameters (approx.) | Input limit | Licence |
|---|---|---|---|---|
| ModernBERT-base | The detector | 150M | 8,192 tokens | Apache-2.0 |
| HateBERT | Extra baseline, fine-tuned on the same data | 110M | 512 tokens | Apache-2.0 |
| DeBERTa-v3-base | Stretch goal: second detector to check results are not one model's quirk | 184M | 512 tokens | MIT |

- Training runs on Google Colab or the laptop GPU; inference runs on a plain CPU in CI.
- Passages are capped at 512 tokens by default, well under ModernBERT's limit, so spans stay readable and runs stay fast. The cap is configurable.
- Licences are confirmed on each model page at download and recorded in the dataset registry (ETH-02).

## Why
- A small, fine-tuned encoder is the lightweight choice, and fine-tuned encoders remain strong classifiers given moderate labelled data; Mendu et al. (2025) @mendu2025safer built their pretraining filter on one.
- ModernBERT is designed for speed and memory efficiency on common hardware and takes 8,192 tokens (Warner et al., 2025), which suits CI run time (CI-03), CPU-only self-hosting and ARCH-04's passages.
- Longer input helped a web-page filter by about 2 F1 points over 512-token models (Mendu et al., 2025).
- HateBERT was retrained on over a million posts from banned Reddit communities (Caselli et al., 2021). Fine-tuning it on the same data and comparing its false-positive rate on identity mentions is a direct, low-cost test of the "mention is not bias" stance.
- DeBERTa-v3 is a strong classic encoder but limited to 512 tokens and slower, so it is a stretch comparison rather than the main model.
- A generative LLM was rejected for the local backend: about 7 to 20 times larger, needing a GPU to run, which undermines self-hosting in CI. It fits better as the commercial backend (DET-04).

## Consequences
- ARCH-04's token budget is 512 tokens by default; because longer context helped Mendu et al. (2025), MET-05 also compares a 1,024-token cap on the stance test.
- ARCH-05 is built around the Hugging Face ecosystem for ModernBERT.
- MET-06 compares a roughly 150M-parameter local model against the commercial backend on accuracy, cost, latency and privacy.
- The Methodology's feasibility section can state that training fits free cloud GPU time.
