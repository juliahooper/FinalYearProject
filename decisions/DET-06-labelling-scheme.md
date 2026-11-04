---
id: DET-06
title: Labelling scheme
group: detector
status: decided
decided_on: 2026-11-02
readings: [mendu2025safer, rottger2021hatecheck, sap2020social, nangia2020crowspairs, vidgen2021introducing, blodgett2021stereotyping, gligoric2024nlp, hartvigsen2022toxigen]
---

## Question
The label set and guidelines for the medical sample.

## Options considered
- **Option A**: a single harm label per passage.
- **Option B**: harm labels plus target ground.
- **Option C**: a structured frame per passage, with prescriptive guidelines. **Chosen.**

## Decision
**Option C, a structured frame per passage, with prescriptive guidelines, decided 2 November 2026.**

| Field | Values | Notes |
|---|---|---|
| Harm labels | Stereotyping, demeaning (either or both), or none | Multi-label |
| Context type | Expresses, mentions, discusses, quotes or counters | A harm label requires "expresses"; the other three are always none |
| Target ground(s) | Any of the nine Equal Status grounds | Recorded for none as well, when a group is mentioned |
| Span | The sentence or sentences responsible | Harm labels only; shown in the report (UI-02) |
| Exclusionary norm tag | Yes or no | Gap set only; analysis only, not trained or scored |
| Stereotype source | Reference for the documented stereotype | Gap set only (VAL-01) |

**Mapping other datasets onto the frame**

| Dataset | Their label | Mapped to |
|---|---|---|
| SBIC | Offensive and group-directed, with an implied stereotype | Stereotyping, expresses |
| SBIC | Offensive and group-directed, with no implied statement | Demeaning, expresses |
| SBIC | Not offensive, or offensive but aimed at an individual rather than a group | None |
| ToxiGen | Toxic statement about a group | Stereotyping or demeaning by a written rule; harmful vs none if unclear |
| ToxiGen | Benign | None |
| HateCheck | Counter-speech functional tests | None, quotes or counters |
| HateCheck | Neutral or positive identity mentions | None, mentions |
| CrowS-Pairs | Stereotyping sentence | Stereotyping, expresses |
| Contextual Abuse Dataset | Identity-directed abuse | Stereotyping or demeaning by a written rule, expresses; harmful vs none if unclear |
| Contextual Abuse Dataset | Counter speech | None, quotes or counters |
| Contextual Abuse Dataset | Person- or affiliation-directed abuse, non-hateful slurs, neutral | None (not about an Equal Status ground, or not harmful); context type not labelled |

Where a dataset does not separate stereotyping from demeaning cleanly, the mapping is marked approximate and that dataset is evaluated on harmful vs none only.

## Why
- Structured, multi-field labels follow Social Bias Frames, which records several linked fields per post rather than one tag (Sap et al., 2020, @sap2020social).
- Giving harmless-but-sensitive text its own categories has precedent: the Contextual Abuse Dataset labels counter speech and non-hateful slurs separately from identity-directed abuse (Vidgen et al., 2021, @vidgen2021introducing).
- The context type field puts the "mention is not bias" stance into the data, so false positives can be broken down by kind (mentions, discussion, quotes) rather than reported as one number. Use versus mention is the distinction it captures (Gligorić et al., 2024).
- Prescriptive annotation suits a model meant to apply one consistent standard, while descriptive annotation suits capturing a range of views. A single labeller building a gate with a defined standard fits the prescriptive paradigm, and it makes intra-rater agreement a check on applying the rules.
- Exclusionary norms is an analysis-only tag because its harm is cumulative, following the definition of Gallegos et al. (2024); it is measured at the source level instead (DET-01, revised).

## Consequences
- A 3 to 5 page labelling guideline is a deliverable: definitions, decision rules, borderline cases, examples per label and the mapping table. It goes in the repo and the appendix.
- MET-05 reports per-label F1 for stereotyping and demeaning, harmful vs none overall, and false-positive rates per context type.
- DET-03 needs training data that includes all four context types; the Contextual Abuse Dataset (CC BY 4.0) is a candidate for counter speech.
- ARCH-04's span identification produces the span field at inference time.
- The gap set tags exclusionary examples and reports how the detector and Detoxify treat them, descriptively.
