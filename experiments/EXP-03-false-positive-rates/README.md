---
id: EXP-03
title: "False-positive rates at filter cut-offs (re-analysis)"
kind: preliminary
status: done
question: "At the cut-offs real pipelines use, what share of harmless and counter-speech sentences would Detoxify remove, and how certain are those rates?"
run_on: 2026-11-04
code_by: claude
origin: ""
depends_on: [EXP-01, EXP-02]
decisions: [MET-05, MET-04]
sections: [work-to-date]
readings: [mendu2025safer, longpre2024pretrainers]
headline: "At a 0.4 cut-off, Detoxify original removes 18 / 150 harmless identity mentions (12%) and 0 / 40 neutral controls; on unbiased, 15 / 16 reporting sentences (94%) are removed, against 7 / 16 (44%) on original"
results:
  - file: results/fp_rates.csv
    caption: "Sentences at or above each cut-off (0.1, 0.4, 0.5) per model and set, with 95% Wilson intervals"
  - file: results/fp_by_term.csv
    caption: "Per identity term: mean score and number of its 10 sentences at or above 0.4 and 0.5"
---

## Question
EXP-01 and EXP-02 report mean scores. A data pipeline doesn't use means: it removes every document whose score is at or above a cut-off. This experiment asks: at the cut-offs used in practice, what share of harmless identity mentions, neutral controls and sentences that report or argue against abuse would Detoxify remove? And, given how few sentences there are, how sure can we be of those shares?

This turns the preliminary study into the numbers the interim report uses, and it is a first look at the kind of threshold reasoning MET-04 has to settle for EvenGround.

## Method
- **Inputs:** the per-sentence scores already computed in EXP-01 (`../EXP-01-identity-mentions/results/exp2_results.csv`) and EXP-02 (`../EXP-02-report-and-counter/results/exp1_results.csv`). Nothing is rescored.
- **Sets:**
  - identity mentions (150) and neutral controls (40) from EXP-01;
  - promotes abuse, reports abuse and argues against abuse (16 each) from EXP-02.
- **Cut-offs:**
  - **0.4**, the Perspective API threshold used by Mendu et al. (mendu2025safer, p. 4);
  - **0.5**, one of the Perspective thresholds in Longpre et al.'s filtering sweep (longpre2024pretrainers, p. 3247);
  - **0.1**, a strict setting. No source in `readings/` uses it.

  A sentence counts as flagged when its score is **at or above** the cut-off.
- **For each model × set × cut-off:**
  - flagged count, n, and rate;
  - 95% Wilson score interval (z = 1.96);
  - mean score.
- **Per term:** for each of EXP-01's 15 identity terms, the mean score and how many of its 10 sentences reach 0.4 and 0.5.
- **Code:** `code/fp_rates.py` (pandas and numpy only). There is no randomness.

## Results
From `results/fp_rates.csv`, at the **0.4** cut-off (rates rounded to one decimal place; the file has full precision):

| Set | original: flagged / n | rate (95% CI) | unbiased: flagged / n | rate (95% CI) |
|---|---|---|---|---|
| Identity mention (EXP-01) | 18 / 150 | 12.0% (7.7–18.2) | 10 / 150 | 6.7% (3.7–11.8) |
| Neutral control (EXP-01) | 0 / 40 | 0.0% (0.0–8.8) | 0 / 40 | 0.0% (0.0–8.8) |
| Promotes abuse (EXP-02) | 15 / 16 | 93.8% (71.7–98.9) | 16 / 16 | 100.0% (80.6–100.0) |
| Reports abuse (EXP-02) | 7 / 16 | 43.8% (23.1–66.8) | 15 / 16 | 93.8% (71.7–98.9) |
| Argues against abuse (EXP-02) | 11 / 16 | 68.8% (44.4–85.8) | 13 / 16 | 81.2% (57.0–93.4) |

Also from `results/fp_rates.csv`, for identity mentions at the other cut-offs:
- **0.5:** 13 / 150 (8.7%) on `original`, 4 / 150 (2.7%) on `unbiased`;
- **0.1:** 49 / 150 (32.7%) and 47 / 150 (31.3%).

From `results/fp_by_term.csv`, identity sentences flagged at 0.4, out of 10 per term:

| Term | original | unbiased |
|---|---|---|
| gay | 5 | 4 |
| transgender | 3 | 2 |
| deaf | 3 | 0 |
| black | 2 | 2 |
| blind | 2 | 0 |
| lesbian | 1 | 1 |
| disabled | 1 | 0 |
| poor | 1 | 1 |
| white, muslim, jewish, asian, christian, immigrant, rural | 0 | 0 |

In the interim report's terms:
- 12% of identity mentions are flagged (18 / 150);
- neutral words are never flagged (0 / 40);
- 44% vs 94% of reporting sentences are flagged (7 / 16 on `original` vs 15 / 16 on `unbiased`, rounded to whole percentages).

## What it means
At a cut-off used in published filtering work, a widely used filter would remove about one in eight harmless sentences that name a group, and none of the matching sentences with a neutral word. The removals are concentrated on a few groups: gay, transgender, deaf, black and blind account for 15 of the 18.

The "debiased" model cuts identity-mention removals from 18 to 10 out of 150 but removes almost every sentence that reports abuse (15 / 16). So switching filters moves the harm from one kind of text to another rather than removing it.

The intervals are the other result. With 16 sentences per set, a 43.8% rate could plausibly be anywhere from about 23% to 67%. Claims in the report should use the counts and intervals, not just the percentage.

This is evidence for:
- MET-05: detector evaluation should report false-positive rates per group, with intervals;
- MET-04: a single global cut-off has very different costs for different kinds of text.

It supplies the numbers and the figure for the preliminary study in `work-to-date`.

## Limits
- The sentences are short templates, not real web text. These are rates on constructed probes, not estimates of how much real data a pipeline removes.
- The report and counter sets have only 16 sentences each, so their intervals are wide (up to 44 percentage points across). The 150 identity mentions give tighter intervals, but each term has only 10 sentences.
- One filter family was tested (two Detoxify models). The 0.4 and 0.5 cut-offs come from work using Perspective API, whose scores aren't calibrated the same way as Detoxify's. So "at the cut-offs real pipelines use" is an approximation.
- The EXP-02 topics are not all about the nine Equal Status grounds (several are about groups such as cyclists or gamers), so the report and counter rates aren't rates for protected groups specifically.
- "Flagged" means at or above the cut-off. EXP-02's notebook summary used strictly above 0.5, so its counts can differ at exactly 0.5.
- For 0 / 40, the lower Wilson bound is stored as -6.3e-18, a floating-point rounding of 0.
- The two readings that give the cut-offs are Claude-drafted summaries not yet verified against the PDFs.

## How to rerun
From this folder (laptop, CPU; run time not recorded, but it only reads two small CSVs):

```
pip install -r requirements.txt
python code/fp_rates.py
```

With no arguments it reads the EXP-01 and EXP-02 results and writes `results/fp_rates.csv` and `results/fp_by_term.csv`. Paths can also be given explicitly:

```
python code/fp_rates.py <exp01 results.csv> <exp02 results.csv> <out fp_rates.csv> <out fp_by_term.csv>
```

If EXP-01 or EXP-02 is rerun, rerun this too and update `run_on`.

## Where this came from
New FYP work. The analysis was drafted with Claude and first run on 3 November 2026 (PLAN.md §9, Appendix A). Claude Code tidied the script on 4 November 2026 (argparse, docstring, clearer names, and "EXP-01" / "EXP-02" set labels in place of the XAI project's "Exp 2" / "Exp 1"). The tidied script's output was checked against the original script's: apart from those labels, both CSVs are identical, and every count matches PLAN.md §9 Appendix B. The committed results are from the tidied script's run on 4 November 2026. Julia is to review it.
