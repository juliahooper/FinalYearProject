---
id: ARCH-04
title: Unit of scoring
group: system
status: decided
decided_on: 2026-11-02
readings: [mendu2025safer, vidgen2021introducing, gligoric2024nlp]
---

## Question
Whether scoring happens per document, chunk or sentence, and how text is chunked.

## Options considered
- **Option A**: whole documents.
- **Option B**: fixed-size chunks.
- **Option C**: single sentences.
- **Option D**: natural passages with sentence-level spans. **Chosen.**

## Decision
**Option D, natural passages with sentence-level spans, decided 2 November 2026.**

1. Text is split on paragraph and sentence boundaries.
2. Consecutive sentences are packed into a passage up to the detector's token budget, with one sentence of overlap between passages.
3. A sentence or a quotation is never split across passages; a passage can be a single sentence.
4. The detector scores each passage.
5. For a flagged passage, the sentence or sentences responsible are identified within the passage's context and become the span shown in the report.
6. The same passages are the unit the representation counter counts.

## Why
- The "mention is not bias" stance depends on context: a quote and the sentence that condemns it are often separate sentences. Without context, about 5% of posts received the opposite toxicity label from annotators (Pavlopoulos et al., 2020), and telling use from mention depends on the surrounding text (Gligorić et al., 2024).
- Longer context helped a pretraining-data filter: a 1,024-token classifier beat 512-token models by about 2 F1 points (Mendu et al., 2025) @mendu2025safer.
- Units must not be too coarse either: removing whole documents over single words in C4 disproportionately removed text by and about minorities (Dodge et al., 2021).
- Sentence-level spans give the report something precise to show non-technical readers (UI-02).
- Single-sentence passages keep the benchmark data in VAL-01 usable without change.

## Consequences
- The token budget is set by the model chosen in DET-02; the rule above holds for any budget.
- Quote handling is needed in the splitter: quotation marks plus reporting verbs such as "said" and "claimed".
- MET-03 must avoid double-counting the overlapping sentence when combining passage scores.
- Finer units remove less useful text alongside biased text, which matters for EVAL-01 and EVAL-06: filtering pretraining data for toxicity trades benchmark performance against toxic generation (Longpre et al., 2024, "A pretrainer's guide to training data").
- The number of passages per source drives CI run time (CI-03).
- Pavlopoulos et al. (2020) also found that context did not improve their classifiers; the paper should acknowledge this and test it, for example by comparing passage-level and sentence-level scoring on the stance test.
