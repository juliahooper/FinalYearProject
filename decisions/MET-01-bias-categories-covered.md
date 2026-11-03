---
id: MET-01
title: Bias categories covered
group: metrics
status: decided
decided_on: 2026-11-02
readings: [caliskan2017semantics, de-arteaga2019bias, rottger2021hatecheck, sap2020social, nangia2020crowspairs, blodgett2020language, blodgett2021stereotyping, antoniak2021bad, nadeem2021stereoset, esri2017who]
---

## Question
Which groups and bias types (gender, race, age, disability, etc.).

## Options considered
- Categories following US-framed benchmarks (gender, race, religion and so on, as in CrowS-Pairs and BBQ) were set aside in favour of the grounds in Irish equality law.
- Source-level word lists for every ground were rejected because seed-list reliability varies by category (see Why).

## Decision
**The nine grounds of Irish equality law at the passage level, four of them at the source level, decided 2 November 2026.**

| Ground (Equal Status Acts) | Passage level (detector) | Source level (word lists) | Benchmark coverage |
|---|---|---|---|
| Gender, including non-binary | Yes | Yes | CrowS-Pairs, BBQ |
| Civil status | Yes | No | None |
| Family status | Yes | No | None |
| Sexual orientation | Yes | Yes | CrowS-Pairs, BBQ |
| Religion | Yes | Yes | CrowS-Pairs, BBQ |
| Age | Yes | No | CrowS-Pairs, BBQ |
| Disability | Yes | No | CrowS-Pairs, BBQ |
| Race, including colour, nationality and ethnic origin | Yes | Yes, group terms only, not names | CrowS-Pairs, BBQ (race and nationality) |
| Membership of the Traveller community | Yes | No | None |

## Why
- The tool is positioned to help meet Irish and EU requirements, so its categories follow the law rather than US-framed benchmarks. The Equal Status Act 2000 (section 3(2)) and the Employment Equality Acts define nine discriminatory grounds; civil status replaced marital status, and housing assistance was added as a tenth Equal Status ground in 2016 but is not a group identity, so it is excluded, as is the victimisation ground also listed in section 3(2).
- The EU AI Act requires training, validation and test data for high-risk systems to be examined for possible biases that could lead to discrimination prohibited under Union law, with measures to detect, prevent and mitigate them (Regulation (EU) 2024/1689, Article 10(2)(f) and (g)). A pre-training data gate is a direct way to support that duty.
- The grounds match measured discrimination in Ireland: Travellers had about ten times the odds of White Irish respondents of reporting discrimination when seeking work, and over 22 times the odds in private services (odds ratios 9.90 and 22.50 from regression models with controls; McGinnity et al., 2017, @esri2017who). The survey included only 55 Travellers, so these estimates are uncertain, but they agree with the All Ireland Traveller Health Study (1,604 Travellers).
- The source level uses seed word lists, whose reliability varies by category. Antoniak and Mimno (2021) @antoniak2021bad show that name lists are unreliable proxies for race: Black and White name lists share surnames and separate poorly, while lists of group terms separate well. Their coherence scores (0.909 for kinship gender terms, 0.910 for Asian vs Caucasian group terms, 0.050 for Black vs White names) measure how well an embedding subspace separates the lists, not how reliably a word count finds a group, so they support the choice of group terms over names rather than measuring the counter's accuracy. Even gender lists scored only 0.375 when built from rare words, so seeds must be common words, with frequencies reported. Only gender, race (by group terms), religion and sexual orientation are counted.
- Gender includes non-binary identities, because treating gender as binary erases non-binary people (Dev et al., 2021).
- Sexual orientation is covered at both levels so the "mention is not bias" stance can be tested; it is a core category in Dixon et al. (2018) @dixon2018measuring and HateCheck (Röttger et al., 2021) @rottger2021hatecheck.
- Group word lists with occupation associations follow the association approach of Caliskan et al. (2017) @caliskan2017semantics.

## Consequences
- Six grounds can be evaluated with the matching subsets of CrowS-Pairs (Nangia et al., 2020) @nangia2020crowspairs and BBQ (Parrish et al., 2022), with the validity caveats of Blodgett et al. (2021) @blodgett2021stereotyping.
- Civil status, family status and the Traveller community have no benchmark, so VAL-01 needs a small test set written and labelled by the author for those three. This is a contribution as well as a cost: no existing bias benchmark covers the Traveller community.
- Training data (DET-03) must include examples for all nine grounds; a trained detector is not limited to word lists, and Social Bias Frames covers about a thousand target groups (Sap et al., 2020) @sap2020social.
- Word lists are documented in the repo with origin and rationale, published as files, checked for presence in the corpus and compared with an alternative list (Antoniak and Mimno, 2021). Keyword matches need disambiguation ("blind date" is not about disability): Udagawa et al. (2025) used a word-sense model for this, so the counter starts with simple context rules and reports its false-match rate on a sample. Their pipeline (protected-group detection, regard classification and co-occurrence across Common Crawl) is the closest prior work to the source level, but it rebalances a corpus offline rather than gating each new source.
- The paper frames the tool as supporting AI Act Article 10 data governance, without claiming legal compliance.
- EVAL-02 measures the trained model on the same grounds where benchmarks exist.
