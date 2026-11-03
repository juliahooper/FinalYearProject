---
id: VAL-01
title: Benchmark datasets
group: validation
status: decided
decided_on: 2026-11-02
readings: [kumar2025detecting, de-arteaga2019bias, rottger2021hatecheck, sap2020social, borkan2019nuanced, nangia2020crowspairs]
---

## Question
E.g. StereoSet and CrowS-Pairs, with their licences and known weaknesses.

## Options considered
- **Option A**: the well-known bias benchmarks alone (CrowS-Pairs, StereoSet, BBQ).
- **Option B**: classifier datasets alone (SBIC, ToxiGen).
- **Option C**: a layered test suite, each part testing one earlier decision. **Chosen.**

## Decision
**Option C, a layered test suite, decided 2 November 2026.**

| Part | Data | What it shows |
|---|---|---|
| Main test | SBIC test split (Sap et al., 2020) and ToxiGen's human-validated subset (Hartvigsen et al., 2022), mapped onto the passage labels (DET-06) | Detector accuracy on real labelled data |
| Per-ground breakdown | CrowS-Pairs stereotyping sentences, positives only (Nangia et al., 2020) | Results for the six grounds the benchmark covers |
| Stance test | HateCheck's non-hateful functional tests, such as counter-speech and identity mentions (Röttger et al., 2021), plus identity templates in the style of Dixon et al. (2018) | False-positive rate on mentions and quotes: the headline result for the "mention is not bias" stance |
| Gap set | About 70 examples per ground for civil status, family status and the Traveller community, written and labelled by the author | Coverage of the three grounds no benchmark includes |
| Source-level test | Artificial sources built from Bias in Bios (De-Arteaga et al., 2019) with a planted gender imbalance per occupation | Whether the representation counter detects a known skew |
| Baseline | An existing toxicity filter (the open-source Detoxify, Hanu and Unitary team, 2020) run over every part | What the tool has to beat |
| Cross-dataset test | Leave-one-dataset-out runs: train without ToxiGen and test on it, train without SBIC and test on it (DET-03) | How much accuracy is lost on an unseen dataset, comparable with Yin and Zubiaga (2021) |

**Gap set method**

- Built as functional tests following CheckList (Ribeiro et al., 2020) @ribeiro2020accuracy and HateCheck (Röttger et al., 2021) @rottger2021hatecheck: six functions per ground (explicit stereotype, implicit stereotype, demeaning, neutral mention, discussing bias, quoted or countered), about 12 cases each, labelled at the time of writing.
- Explicit cases come from templates with group slots; implicit cases are written by hand.
- Harmless cases get swapped-group variants as invariance tests: the label must stay "none" when the group changes, following counterfactual token fairness (Garg et al., 2019).
- Every stereotype is based on a documented source, recorded beside the example, starting from McGinnity et al. (2017) @esri2017who, so it is clear what each case measures (Blodgett et al., 2021).
- A random 20% is re-labelled blind at least two weeks later, and agreement is reported with Cohen's kappa (Cohen, 1960) as intra-rater agreement.
- Results are reported per function with confidence intervals and framed as diagnostic, not as real-world accuracy.
- Harmful examples are kept minimal, slurs are masked in the paper and a content warning is given (Kirk et al., 2022).

## Why
- The well-known bias benchmarks were built to probe language models by comparing sentence pairs, not to label passages, so they are a poor fit as the detector's main test. Only CrowS-Pairs' stereotyping sentences are usable as labelled positives (@nangia2020crowspairs, @nadeem2021stereoset).
- SBIC and ToxiGen were built for classifiers and include implicit bias, which detectors relying on surface cues miss (Hartvigsen et al., 2022).
- HateCheck already tests the use-mention distinction the project takes a stance on.
- Each part of the suite tests one earlier decision: the definition (DET-01), the grounds (MET-01) and the source level.

## Consequences
- **Interim deliverable:** run Detoxify over HateCheck's non-hateful identity-mention and counter-speech cases and report the false-positive rate as the first baseline result. (A preliminary study on template sentences has been run; see the master plan.)
- DET-03 trains on both SBIC and ToxiGen, so their test splits are held out, and generalisation is shown on CrowS-Pairs, HateCheck and the gap set, which are never trained on.
- MET-05 must cover per-group false-positive rates; the identity-group metrics of Borkan et al. (2019) @borkan2019nuanced are the starting point.
- BBQ (Parrish et al., 2022) and StereoSet (Nadeem et al., 2021) are kept for EVAL-02, where they test the trained model's outputs.
- The gap set is a contribution in its own right for the deliverable section.
- ETH-02 checks the licence of every dataset listed here.
