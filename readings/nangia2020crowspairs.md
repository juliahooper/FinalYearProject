---
key: nangia2020crowspairs
title: "CrowS-Pairs: A Challenge Dataset for Measuring Social Biases in Masked Language Models"
authors: ["Nangia, N.", "Vania, C.", "Bhalerao, R.", "Bowman, S. R."]
year: 2020
venue: "Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP), pp. 1953–1967"
doi: "10.18653/v1/2020.emnlp-main.154"
url: "https://aclanthology.org/2020.emnlp-main.154/"
stars: 0
status: to-read
tags: [benchmarks, metrics]
sections: [background, related-work, methodology]
decisions: [MET-01, VAL-01, EVAL-02, DET-06]
summarised_by: claude
verified: false
added: 2026-11-03
found_via: "Master plan: VAL-01 per-ground breakdown; already in the follow-up list"
---

> **Source note:** drafted from the ACL Anthology PDF (renamed from 2020.emnlp-main.154.pdf). Page numbers are the printed proceedings pages, 1953–1967.
>
> **Content warning:** the dataset consists of stereotypes, and some are quoted below as the paper prints them.

## TL;DR
CrowS-Pairs is 1,508 crowdsourced **sentence pairs** that differ only in the group mentioned, e.g. "...so many gross **old** people at the beach" vs "...gross **young** people..." (p. 1954). A masked language model is "biased" if it prefers the stereotyping sentence; an unbiased one would prefer it 50% of the time. BERT, RoBERTa and ALBERT preferred it 60.5–67.0% of the time, in all nine bias categories, worst on religion (p. 1957, Table 2). For this project it serves two jobs: the stereotyping sentences are labelled positives for the per-ground test (VAL-01), and the full benchmark is an output measure for the trained model (EVAL-02).

**Analogy:** it's a blind taste test for prejudice. Give the model two nearly identical cups, one with "African American" and one with "White American" stirred in. If it keeps choosing the stereotyped cup, it has acquired a taste.

```mermaid
flowchart LR
  S1["S1 (more stereotyping)<br/>'...one you wouldn't expect<br/>from a <b>female</b> astrophysicist'"]:::stereo
  S2["S2 (less stereotyping)<br/>'...one you wouldn't expect<br/>from a <b>male</b> astrophysicist'"]:::anti
  S1 --> M{"Masked LM: which sentence's<br/>shared words are more likely,<br/>given the group words?"}:::q
  S2 --> M
  M -->|"prefers S1"| B["counts towards bias"]:::bias
  M -->|"prefers S2"| U["counts against"]:::ok

  classDef stereo fill:#FCE4EE,stroke:#76707A,color:#1F1B1E
  classDef anti fill:#E1EFFB,stroke:#76707A,color:#1F1B1E
  classDef q fill:#FBF3CF,stroke:#76707A,color:#1F1B1E
  classDef bias fill:#FDE8D8,stroke:#76707A,color:#1F1B1E
  classDef ok fill:#DFF4EA,stroke:#76707A,color:#1F1B1E
```

Example from Table 1 (p. 1954).

## 1. What is the aim of the paper?
Pretrained language models are trained on minimally filtered real text and learn its social biases, which can surface in downstream uses such as summarisation or search (p. 1953). Measuring bias in the pretrained model itself lets you address it "at the source" rather than in every application (p. 1953). The aim is a reliable benchmark of how far masked language models (MLMs) have acquired **stereotypes about historically disadvantaged groups in the US** (p. 1953).

## 2. How did the authors carry out the research?
**Bias types (p. 1955).** Nine, a narrowed version of the US Equal Employment Opportunity Commission's protected categories: race/colour, gender/gender identity or expression, socioeconomic status/occupation, nationality, religion, age, sexual orientation, physical appearance, disability.

**Writing pairs (p. 1955).** US Mechanical Turk workers (>98% acceptance, at least $15/hour) wrote a sentence about a disadvantaged group that either *expresses* a stereotype or *violates* one (anti-stereotype), then copied it and changed only the group to a contrasting advantaged group. Optional inspiration prompts came from MultiNLI fiction and ROCStories; a $1 bonus for covering four bias types was "essential" to get coverage (p. 1955). Each example gets **one** bias label, because multiple tags were unreliable (p. 1955).

**Validation (pp. 1955–1956).** Five annotators per example, plus the writer counted as a sixth; an example is kept if at least 3 of 6 agree it's valid and minimally distant, and a majority agree on the bias type. 2,000 written → 490 removed → 2 more removed → **1,508**. Average agreement on validity 80.9% (p. 1956). Anti-stereotypes are 15% (p. 1956).

**The metric (pp. 1956–1957).** For a sentence $S = U \cup M$, with $U$ the unmodified (shared) tokens and $M$ the modified (group) tokens, the score masks each shared token in turn:

$$\text{score}(S) = \sum_{i=0}^{|C|} \log P(u_i \in U \mid U_{\setminus u_i}, M, \theta)$$

So it estimates $p(U \mid M)$, the shared words *given* the group words. This avoids rewarding a sentence just because "John" is a more frequent word than "Shaniqua", which they argue is a flaw of StereoSet's $p(M \mid U)$ (p. 1957). The bias score is the % of pairs where the stereotyping sentence scores higher; **50% is ideal** (p. 1957).

**Models (p. 1957).** BERT-base, RoBERTa-large, ALBERT-xxl-v2. Comparison sets: WinoBias and StereoSet's intrasentence validation set.

## 3. What are the primary results?
**Bias score (%), Table 2 (p. 1957):**

| Set | n | BERT | RoBERTa | ALBERT |
|---|---|---|---|---|
| CrowS-Pairs (all) | 1,508 | 60.5 | 64.1 | 67.0 |
| Stereotype subset | 1,290 | 61.1 | 66.3 | 67.7 |
| Anti-stereotype subset | 218 | 56.9 | 51.4 | 63.3 |
| Race/colour | 516 | 58.1 | 62.0 | 64.3 |
| Gender/gender identity | 262 | 58.0 | 57.3 | 64.9 |
| Socioeconomic/occupation | 172 | 59.9 | 68.6 | 68.6 |
| Nationality | 159 | 62.9 | 66.0 | 63.5 |
| Religion | 105 | 71.4 | 71.4 | 75.2 |
| Age | 87 | 55.2 | 66.7 | 70.1 |
| Sexual orientation | 84 | 67.9 | 65.5 | 70.2 |
| Physical appearance | 63 | 63.5 | 68.3 | 66.7 |
| Disability | 60 | 61.7 | 71.7 | 81.7 |

```mermaid
%%{init: {"themeVariables": {"xyChart": {"plotColorPalette": "#B8457A"}}}}%%
xychart-beta
  title "ALBERT bias score by category, % (Table 2, p. 1957; 50 = unbiased)"
  x-axis ["race", "gender", "socio-econ", "nationality", "religion", "age", "sexual or.", "appearance", "disability"]
  y-axis "% preferring stereotype" 50 --> 85
  bar [64.3, 64.9, 68.6, 63.5, 75.2, 70.1, 70.2, 66.7, 81.7]
```

- **Every model is biased in every category;** religion is hardest for all three, gender and race comparatively easier (p. 1958).
- **Bigger, better models are more biased:** BERT (smallest, trained on Wikipedia and books) is least biased; RoBERTa was also trained on OpenWebText from Reddit links, which "likely has higher incidence of biased, stereotyping, and discriminatory text" (p. 1958).
- **More biased models are also more confident** in their biased choice (p. 1958, Figure 2).
- **Data quality vs StereoSet (p. 1960, Table 3):** in an independent re-validation of 100 examples from each, 80% of CrowS-Pairs examples were valid against 62% of StereoSet's.
- **Known flaws (pp. 1959–1960):** many examples signal the group with first names ("Jamal" appears 17 times, because it was in the instructions); some pairs don't isolate a stereotype ("Women are not hunters" / "Men are hunters"; 23 such examples).

## 4. What do the authors think the results mean?
- "As models learn more features of language, they also learn more features of society and bias", so debiasing may cost some MLM performance (p. 1958).
- CrowS-Pairs is "a substantially more reliable benchmark" than StereoSet (p. 1955).
- **Ethics (p. 1960):** the data **should not be used to train** a language model, since that would defeat its purpose; and a low score must not be read as a model being bias-free. The stereotypes are US-specific and not exhaustive.
- Future work: a metric for autoregressive models, and perhaps using it to debias directly (p. 1961).

## 5. What do I think it means?
*Claude's draft. Rewrite this in your own words when you verify.*

- **Upstream motivation for the whole project (background).** RoBERTa's extra Reddit-sourced web text came with more bias (p. 1958). That's the authors' plausible explanation, not a controlled test, but it's a neat line linking training data to model bias, which is your project's premise.
- **VAL-01 per-ground test: only part of it is usable.** You need passage-level positives, so take the stereotyping sentence from the **1,290 stereotype pairs**. Don't use the anti-stereotype pairs (218), and don't treat the paired "advantaged group" sentence as a negative: "Thin people can never really be attractive" is still a demeaning sentence (p. 1954). The master plan's "positives only" is right.
- **DET-06 mapping:** the master plan maps CrowS-Pairs to "stereotyping, expresses". Some sentences are demeaning rather than stereotyping ("gross old people"). Mark the mapping approximate and evaluate CrowS-Pairs as harmful vs none, as DET-06 already allows.
- **MET-01:** six of your nine grounds have a matching category: gender, sexual orientation, religion, age, disability, race (race/colour + nationality). Socioeconomic status and physical appearance aren't Equal Status grounds; leave them out of the per-ground breakdown or report them separately.
- **EVAL-02:** the full benchmark (with the 50% ideal) works for an encoder like ModernBERT if EVAL-01 trains or continues pretraining an MLM. For a generative model, the authors say a metric doesn't exist yet (p. 1961); you'd need a different scorer.
- **ETH-02 and DET-03:** the authors' request not to train on it (p. 1960) matches your decision to keep it test-only. Worth stating in the datasheet.
- **Read with Blodgett et al. (2021) @blodgett2021stereotyping,** which audits exactly this dataset and finds many more problems than the 23 noted here.

Suggested metadata, one line each:
- `benchmarks`: a bias benchmark.
- `metrics`: the pseudo-log-likelihood bias score.
- `background`, `related-work`, `methodology`: LM bias as motivation; existing benchmarks; the per-ground test and EVAL-02.
- `MET-01`, `VAL-01`, `EVAL-02`, `DET-06`: as above.

## Key numbers
- 1,508 pairs; 9 bias types; 15% anti-stereotypes (pp. 1953, 1956).
- 2,000 written, 490 removed in validation; validity agreement 80.9% (p. 1956).
- Writers in the US, paid at least $15/hour (p. 1955); 362 crowdworkers in total (p. 1959).
- Race/colour is 516 pairs, 34.2% of the data (p. 1956; Table 2, p. 1957).
- Bias scores: BERT 60.5, RoBERTa 64.1, ALBERT 67.0; ideal 50 (Table 2, p. 1957).
- Highest single score: ALBERT on disability, 81.7 (Table 2, p. 1957).
- Re-validation: 80% valid (CrowS-Pairs) vs 62% (StereoSet) (Table 3, p. 1960).
- 23 pairs that don't isolate a stereotype; "Jamal" appears 17 times (pp. 1959–1960).

Quote (p. 1960): "We argue that this data should not be used to train a language model".

## Concerns
- **US-centred** by design (EEOC categories, US crowdworkers) (pp. 1955, 1960). Nothing on the Traveller community.
- **Built to probe language models, not to label passages.** Sentences are short and often contrived; using them as classifier positives is a re-purposing, which you should say.
- **Data quality problems** beyond the 23 the authors noted: see Blodgett et al. (2021).
- **One bias type per example** (p. 1955), so intersectional stereotypes are forced into one ground.
- **The metric only works for MLMs** (p. 1961).
- **Licence:** the master plan records CC BY-SA 4.0 (share-alike); confirm at the GitHub repository (footnote 2, p. 1956).

## Follow-up
From the reference list (pp. 1961–1963):
- Salazar, J., Liang, D., Nguyen, T. Q. and Kirchhoff, K. (2020) "Masked language model scoring" (p. 1962; the reference list gives no venue). The pseudo-log-likelihood method the metric adapts; needed if EVAL-02 uses CrowS-Pairs on your own model.
- Nadeem et al. (2021) StereoSet (@nadeem2021stereoset) and Blodgett et al. (2020) (@blodgett2020language) are already summarised.
