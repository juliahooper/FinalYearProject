---
id: DET-01
title: Definition of representational bias
group: detector
status: decided
decided_on: 2026-11-02
readings: [caliskan2017semantics, mendu2025safer, dixon2018measuring, de-arteaga2019bias, rottger2021hatecheck]
---

## Question
The working definition and taxonomy the tool detects.

## Options considered
- **Option A**: passage level only (harms visible in a single passage).
- **Option B**: source level only (how groups are represented across a source).
- **Option C**: two levels, passage and source. **Chosen.**

Revised 2 November 2026 during DET-06: exclusionary norms moved from the passage level to the source level.

## Decision
**Option C (two levels), decided 2 November 2026.**

**Working definition (for the paper):** representational bias is text that portrays a social group in a way that reinforces its lower social standing. The tool detects it at two levels. At the passage level, it detects harms expressed in the text itself. At the source level, it measures how groups are represented across the whole source against a configurable reference. Text that mentions a group, discusses bias, or quotes biased language in order to report or challenge it is not representational bias.

| Level | Category | What it means |
|---|---|---|
| Passage | Stereotyping | Applies a fixed, over-generalised trait to a group |
| Passage | Demeaning language | Belittles or insults a group as a whole |
| Source | Under-representation | A group's share of mentions falls well below the reference |
| Source | Erasure | A group expected in the source barely appears or is absent |
| Source | Skewed association | Groups co-occur with different occupations or traits at very different rates |
| Source | Exclusionary norms | One group is consistently treated as the default across the source, for example engineers almost always referred to as "he" |

*Revised 2 November 2026 during DET-06:* exclusionary norms moved from the passage level to the source level. A single instance is rarely harmful and hard to label consistently; the harm is cumulative, which is what the source level measures. Exclusionary examples are still tagged in the gap set for descriptive analysis.

**Project stance: mention is not bias.** The tool flags text that *expresses* bias, never text that only mentions a group, discusses bias, or quotes biased language inside reporting, examples or counter-speech. Existing filters get this wrong systematically, and it removes exactly the text by and about minority groups that training data needs.

- Toxicity classifiers score harmless sentences as toxic just for containing identity terms such as "gay" (Dixon et al., 2018, @dixon2018measuring).
- Hate speech models label tweets in African American English as offensive up to twice as often, because annotators were insensitive to dialect (Sap et al., 2019).
- Blocklist filtering of the C4 corpus disproportionately removed text from and about minority individuals (Dodge et al., 2021).
- Models struggle to separate *using* harmful language from *mentioning* it, so quoted counter-speech gets flagged; teaching the distinction reduces the errors (Gligorić et al., 2024).
- HateCheck shows that state-of-the-art and commercial hate speech models have critical weaknesses on functional tests of this kind (Röttger et al., 2021, @rottger2021hatecheck).
- Separating harmful intent ("Toxic") from discussion of a harmful topic ("Topical") lets a pretraining filter keep useful text (Mendu et al., 2025, @mendu2025safer). A fairness-oriented regard filter also downsampled a news report of a racist assault (Udagawa et al., 2025), and a GPT-3-style quality filter favoured writing from wealthier, urban schools (Gururangan et al., 2022).

## Why
- Blodgett et al. (2020) @blodgett2020language argue bias work must state exactly what it treats as harmful, to whom and why; this definition does that.
- The passage categories come from the representational-harm taxonomy of Gallegos et al. (2024), limited to the harms visible in a single passage.
- Erasure and under-representation cannot be seen in one passage, so they are measured across the source, following the corpus-level documentation of Dodge et al. (2021) and the association approach of Caliskan et al. (2017) @caliskan2017semantics.
- Neither level alone is enough: a source of neutral profiles that never mention women passes a passage check, and a balanced source can still contain stereotyping passages.
- The representation reference (an even split, a real-world distribution or a reference corpus) is a value judgement, so it is configurable with a documented default.

## Consequences
- DET-06: labelling guidelines need explicit rules and examples for identity mentions, discussion of bias, and quoted hateful language, with "none" as the correct label.
- DET-03: the training data needs hard negatives of exactly those kinds, not just clean text.
- VAL-01 and MET-05: the stance becomes a headline result. Measure false positives on identity mentions and quoted counter-speech, compared with an existing toxicity filter as the baseline.
- MET-01: the source level needs a word list per group and a minimum source size before its statistics count.
- ARCH-07: the reference distribution is a configuration setting.
- Medical categories are out of scope for now and will be added at the end; the interim report presents medical text as a planned extension.
