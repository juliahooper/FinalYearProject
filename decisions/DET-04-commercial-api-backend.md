---
id: DET-04
title: Commercial API backend
group: detector
status: decided
decided_on: 2026-11-03
readings: [mendu2025safer]
---

## Question
Which API, and how prompts and outputs are structured.

## Options considered
- **Token probabilities** from the API: rejected as the default, since verbalised confidence is better calibrated for RLHF models and not every API exposes them.
- **Asking several times** and using the share of agreeing answers: about five times the cost, so left as a possible experiment.
- **A provider-neutral adapter with recalibrated verbalised confidence.** **Chosen.**

## Decision
**A provider-neutral adapter with one default provider, a guideline prompt with worked examples, and recalibrated verbalised confidence, decided 3 November 2026.**

| Part | Decision |
|---|---|
| Provider | A small adapter interface (send a passage, get the DET-06 frame back) with one default provider, tested fully. Others can be added through configuration. The default is chosen at build time by price per million tokens and whether a no-data-retention option exists. |
| Stretch goal | Test three providers through the same adapter and compare them in MET-06. |
| Prompt | The DET-06 definitions, the "mention is not bias" rule, target-ground information and a few worked examples per label, including hard negatives (a quote, a discussion, a neutral mention). Temperature 0. |
| Probability | The response includes a 0 to 1 confidence per harm label, recalibrated with Platt scaling on the same calibration split as the local model, so the two backends' scores are comparable. |
| Output | Strict JSON matching the DET-06 frame, validated against a schema; one retry, then marked "backend error", never silently passed. |
| Cost | Results cached by a hash of the passage text and model version; tokens used are reported per run for MET-06. |
| Privacy | Opt-in only, with a warning that text leaves the machine (ETH-02). |

## Why
- A provider-neutral adapter fits an open-source, self-hostable tool and lets users pick a provider whose data terms they accept.
- LLMs can make the same identity-term and use-versus-mention errors as other classifiers, so the prompt states the "mention is not bias" rule explicitly, as teaching the distinction reduces errors (Gligorić et al., 2024), and worked hard-negative examples reinforce it.
- The fine-tuned local model is expected to be the stronger classifier, so the API is expected to serve mainly as a second opinion in the ensemble (DET-05).
- For models tuned with human feedback, verbalised confidence was better calibrated than token probabilities, often cutting calibration error by about half (Tian et al., 2023), and not every API exposes token probabilities.
- Verbalised confidence can still be overconfident, so it is recalibrated rather than used raw.
- Asking several times and using the share of agreeing answers could reduce overconfidence but costs about five times as much, so it is left as a possible experiment, not the default.

## Consequences
- DET-05 can compare the two backends' scores directly, since both are calibrated probabilities.
- MET-06 measures accuracy, cost per 1,000 passages, latency and privacy for the local model against the default provider (three providers if the stretch goal is reached).
- ARCH-07 holds the provider, model name and API key setting; the key is read from the environment, never the config file.
- The prompt and its worked examples are versioned in the repo and reported in the paper's appendix.
