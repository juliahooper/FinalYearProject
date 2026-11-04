---
id: EXP-02
title: "How an off-the-shelf filter treats reporting and arguing against abuse"
kind: preliminary
status: done
question: "Does Detoxify flag sentences that report or argue against abuse as often as sentences that promote it?"
run_on: 2026-10-09
code_by: julia
origin: "Julia's own runs for the XAI module group project, repo MistorRonan/ISE-XAI-Group-10 at commit 9a6664468b9e472cd4f3dfe29f8657fdd9b5b1c4"
reuse_approved: pending
depends_on: []
decisions: [DET-01, DET-06, DET-03]
sections: [work-to-date, methodology]
readings: [gligoric2024nlp, rottger2021hatecheck]
headline: "Mean P(toxic) for promoting, reporting and arguing against the same insult: 0.88, 0.43 and 0.57 on Detoxify original; 0.96, 0.84 and 0.74 on unbiased"
results:
  - file: results/fig_exp1_scores.png
    caption: "Mean P(toxic) (± 1 SD) for sentences that promote, report or argue against abuse, Detoxify original and unbiased"
  - file: results/exp1_summary.csv
    caption: "Mean scores per condition (the share column is a SHAP measure, not used here)"
  - file: results/exp1_results.csv
    caption: "Every sentence with its scores from both models (share_*, rho, top1_agree, top3_overlap and lime_fidelity are SHAP and LIME measures, not used here)"
---

## Question
Does Detoxify flag sentences that report abuse ("The court heard the defendant called his neighbours filthy pigs.") or argue against it ("It was cruel of him to call his neighbours filthy pigs.") as often as sentences that promote it ("My neighbours are filthy pigs and I hate them.")?

This matters for EvenGround because news reports, research, moderation discussion and counter-speech are exactly the text a fair training set should keep. A filter that removes them along with real abuse strips out the discussion of harm, often about the groups that are targeted. That bears on how bias is defined (DET-01) and on how training data for the detector has to be labelled (DET-06).

## Method
- **Sentences:** 16 topics, each written 3 ways around the same insult: **promote** (the speaker uses it), **report** (it is quoted or described) and **counter** (it is rejected). That makes 48 sentences, 16 per condition (`data/exp1_sentences.csv`).
  - The topics are football fans, immigrants, politicians, vegans, teenagers, neighbours, refugees, women, poor people, a referee, gamers, tourists, cyclists, students, rural people and older people.
- **Models:** Detoxify `original` and `unbiased`. The score is the `toxicity` output, read as P(toxic), in batches of 64.
- **Seed:** 42 (numpy and torch). Scoring itself has no randomness.
- **Environment:** Google Colab, T4 GPU (from the notebook's metadata).

Which notebook cells (`code/01_report_vs_promote.ipynb`) this experiment uses:
- **Cell 1** (install, imports and shared helpers): loads both models and defines `proba`.
- **Cell 2** (the sentences): the 48 rows, plus a word count per sentence.
- **Cell 3** (score every sentence with both filters): the scores used here.
- **Cell 7** (Figure 1, the scores chart): `fig_exp1_scores.png`.
- **Cell 10** (results summary): `exp1_summary.csv`. Only its `p_orig` and `p_unb` columns are used here.

Cells 4–6, 8 and 9 are the SHAP and LIME analyses for the XAI module and are not part of this experiment.

## Results
- **Mean P(toxic) per condition** (`results/exp1_summary.csv`):

  | Condition | original | unbiased |
  |---|---|---|
  | Promotes abuse | 0.88 | 0.96 |
  | Reports abuse | 0.43 | 0.84 |
  | Argues against abuse | 0.57 | 0.74 |

- **The spread is wide.** `results/fig_exp1_scores.png` shows the means with ± 1 standard deviation. Per-sentence scores in `results/exp1_results.csv` range as follows:

  | Condition | original | unbiased |
  |---|---|---|
  | Promotes abuse | 0.014 to 0.991 | 0.659 to 0.997 |
  | Reports abuse | 0.001 to 0.919 | 0.149 to 0.995 |
  | Argues against abuse | 0.009 to 0.943 | 0.027 to 0.996 |
- **Counts at a cut-off** are in EXP-03 (`fp_rates.csv`), which uses this experiment's scores.

## What it means
On `original`, reporting and counter-speech score lower than promotion on average, but they're still far from safe: their mean scores are 0.43 and 0.57. On `unbiased`, the model built to reduce identity bias, reporting sentences average 0.84, close to the 0.96 for promotion.

So the filter reacts mostly to the insult itself, not to whether the speaker is using, quoting or rejecting it. Using `unbiased` makes this worse, not better. A filter like this would remove much of the text that discusses abuse.

This is evidence for:
- DET-01: what counts as harmful has to account for intent, not only wording;
- DET-06: training labels need to separate use from mention and counter-speech;
- DET-03: an off-the-shelf model can't be used unchanged.

It is the second part of the preliminary study in the interim report (`work-to-date`, with the setup in `methodology`).

## Limits
- The sentences are short templates, not real web text.
- Each condition has only 16 sentences, so means and rates have wide uncertainty (EXP-03 gives Wilson intervals).
- One filter family was tested (two Detoxify models).
- The topics are not all about the nine Equal Status grounds. Some are (women, older people, immigrants and refugees); others (football fans, vegans, gamers, cyclists, a referee) aren't protected groups at all.
- Report and counter sentences are longer than promote sentences: on average 10.4 and 9.5 words against 7.1 (the `n_words` column in `results/exp1_results.csv`). Length alone may change the score.
- `run_on` is the date the results were committed to the source repo (9 October 2026). The notebook doesn't record when it was run.
- Library versions weren't recorded (see `requirements.txt`), so a rerun may give slightly different scores.

## How to rerun
1. Open `code/01_report_vs_promote.ipynb` in Google Colab and pick a GPU runtime (it was run on a T4). It also runs on CPU, more slowly.
2. Run all cells in order. Cell 3 produces the scores, but `exp1_results.csv` is only saved at the end of cell 6, after the SHAP and LIME columns are added, and cell 10's summary needs cell 5. So the whole notebook has to run.
3. Outputs go to `outputs_exp1/`; cell 11 zips them for download.
4. Copy `exp1_results.csv`, `exp1_summary.csv` and `fig_exp1_scores.png` into `results/`, overwriting them. Update `run_on`.
5. Record versions with `pip freeze > requirements.txt` after cell 1's installs.

Run time wasn't recorded.

## Where this came from
This is reused work from the XAI module's group project (ISE XAI Group 10), in the public repo [MistorRonan/ISE-XAI-Group-10](https://github.com/MistorRonan/ISE-XAI-Group-10). Files were taken from commit `9a6664468b9e472cd4f3dfe29f8657fdd9b5b1c4`.

- **Team:** that repo's README lists Julia Hooper, Bláithín Kavanagh, Rory Linnane and April Gilhool.
- **Who did what:** Julia states that she designed, coded and ran this experiment.
- **What the git history shows:**
  - The notebook and the sentence file were first committed by Bláithín Kavanagh (`blaithinn`) on 8 October 2026, in commit `f2bfc8c`.
  - Julia moved them into `experiments/report vs promote/` on 9 October 2026 (`6a3020c`), changing only the chart colours in the notebook.
  - Julia committed the results the same day (`dd1bf92`).
  - Who commits a file doesn't always show who wrote it.
- **Copied:** the notebook, unmodified, into `code/`; the sentence file into `data/`; three result files, unmodified, into `results/`.
- **Not copied:** the group's write-up of this experiment (`EXP1_report_vs_promote.md`), the paper, journal and plans, and the SHAP and LIME outputs. Those answer the XAI module's question, not this project's.
- **New for the FYP:** this README, written fresh.

Supervisor approval of reuse: pending (asked <date>).
