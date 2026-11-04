---
id: DET-03
title: Fine-tuning method and training data
group: detector
status: decided
decided_on: 2026-11-03
readings: [dixon2018measuring, sap2020social, borkan2019nuanced, vidgen2021introducing, guo2017calibration, gebru2021datasheets, dror2018hitchhikers, gligoric2024nlp, hartvigsen2022toxigen, sap2019risk, arango2019hate, yin2021generalisable, pavlopoulos2020toxicity, garg2019counterfactual, mitchell2019model]
---

## Question
Method (e.g. LoRA) and which labelled data.

## Options considered
- **Full fine-tuning** of ModernBERT-base. **Chosen.**
- **LoRA**: rejected; designed to adapt very large models, so its savings at 150M parameters are small and it adds a hyperparameter to justify.

## Decision
**Full fine-tuning on SBIC, ToxiGen and the Contextual Abuse Dataset plus generated hard negatives, with a masked loss for the context head, decided 3 November 2026.**

**Method**

- Full fine-tuning of ModernBERT-base: all weights are updated.
- Multi-task outputs (MET-02): two sigmoid harm outputs (stereotyping, demeaning) and a four-way context-type output.
- Masked loss: the context head only learns from examples that have a context label (CAD counter speech, generated hard negatives and clean mappings); the harm outputs learn from every example.
- Class-weighted loss or balanced sampling, because biased passages are a minority.
- Three random seeds per configuration, reported as mean and spread; all hyperparameters (learning rate, epochs, batch size, seed) are reported.

**Data splits**

| Split | Contents |
|---|---|
| Training | SBIC and ToxiGen training splits, the Contextual Abuse Dataset, generated hard negatives |
| Calibration | A held-out slice of the training data, used only for temperature scaling (MET-02) |
| Test, in-distribution | SBIC and ToxiGen test splits |
| Test, out-of-distribution | CrowS-Pairs, HateCheck and the gap set, never trained on |

**Leakage safeguards**

- Split by post, not by row: SBIC has several annotations per post, and all of a post's rows go to the same split.
- Remove near-duplicates (identical after normalising case, spacing and punctuation) from the calibration and test splits if they appear in training.
- Oversample or reweight only after splitting, never before.
- Leave-one-dataset-out runs: train on SBIC and CAD and test on ToxiGen; train on ToxiGen and CAD and test on SBIC. Two extra training runs measure how much the detector loses on an unseen dataset.

Leaks between training and test data have inflated published hate speech results enormously: duplicated tweets in both splits raised one model from 79.6 to 94.5 macro-F1, and a model scoring about 70 to 75% F1 on the hateful class within its own dataset scored about 21% on another (Arango et al., 2019). Detectors generally lose significant performance on a different dataset from the one they were trained on, so results on their own test split are overestimated (Yin and Zubiaga, 2021).

**Generated hard negatives**

- Harmless examples containing identity terms for all nine grounds, in the three harmless context types: mentions, discussion, and quotes or counters.
- Built from new templates that do not overlap with HateCheck or the gap set, so the stance test measures generalisation, not memorisation.
- Kept in their own files, every example tagged `source: generated`, with their own datasheet (ETH-02).

**Making the data edit visible and configurable**

- Training is driven by a config file that lists the datasets used and switches the generated hard negatives on or off.
- Two detector checkpoints are trained and released: with hard negatives (the default) and without. The tool's configuration (ARCH-07) chooses which one runs.
- Each checkpoint ships with a model card (Mitchell et al., 2019) stating its training data, the share of generated examples, its intended use and its results per ground.
- Every report names the checkpoint that produced it and whether its training data included generated examples.

## Why
- Full fine-tuning is the standard approach at 150M parameters and fits free cloud GPU time. LoRA was designed to adapt very large models, so its savings at this size are small and it adds a hyperparameter to justify.
- Three training sources generalise better than one, and each adds something: stereotype implications (SBIC; Sap et al., 2020, @sap2020social), implicit statements about 13 groups (ToxiGen; Hartvigsen et al., 2022) and labelled counter speech (CAD; Vidgen et al., 2021, @vidgen2021introducing).
- Hard negatives put the "mention is not bias" stance into the model. Dixon et al. (2018) @dixon2018measuring reduced unintended bias by adding non-toxic examples containing identity terms, and teaching the use-mention distinction reduced errors on counter-speech (Gligorić et al., 2024).
- A masked loss avoids inventing context labels for data that has none.
- CAD's counter speech is a small, noisy signal: only 220 counter-speech labels (115 against identity-directed abuse), with low annotator agreement (Fleiss' κ 0.267), and every one was labelled using the earlier messages in its thread, which the detector does not see (Vidgen et al., 2021, @vidgen2021introducing). So the generated hard negatives carry most of the "quotes or counters" signal for the context head, and CAD counter speech is only used where the entry itself quotes or names the abuse it counters; the rest is kept for the harm outputs (as none) but not used as a context-type example.
- Training both checkpoints turns the data edit into an experiment: comparing their false-positive rates on identity mentions measures the effect of the hard negatives directly.

## Consequences
- MET-05 adds an ablation: with versus without hard negatives, on every test set.
- ARCH-07 has a setting for which checkpoint to run.
- UI-01 shows the checkpoint and its training data on every report.
- The CAD filter (counter speech that quotes or names the abuse) is a written rule in the labelling guideline (DET-06), and the number of CAD counter-speech examples kept is reported.
- CAD comments from the same thread stay in the same split, as in the dataset's own experiments.
- ETH-02 adds datasheets for the Contextual Abuse Dataset (CC BY 4.0) and the generated hard negatives, and a licence check for SBIC before training.
- The template design for hard negatives is a Methodology detail worth a short table in the paper.

## Resources
Datasets, models and tools this decision relies on. Papers are in the Readings panel.

- [Social Bias Inference Corpus (SBIC)](https://maartensap.com/social-bias-frames/): official page, as given in Sap et al. (2020).
- [ToxiGen](https://github.com/microsoft/ToxiGen): official repository, as given in Hartvigsen et al. (2022).
- [Contextual Abuse Dataset](https://github.com/dongpng/cad_naacl2021): official repository, as given in Vidgen et al. (2021).
