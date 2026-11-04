---
id: EXP-01
title: "How an off-the-shelf filter treats harmless identity mentions"
kind: preliminary
status: done
question: "Does Detoxify score harmless sentences higher just because they name a group?"
run_on: 2026-10-09
code_by: julia
origin: "Julia's own runs for the XAI module group project, repo MistorRonan/ISE-XAI-Group-10 at commit 9a6664468b9e472cd4f3dfe29f8657fdd9b5b1c4"
reuse_approved: pending
depends_on: []
decisions: [DET-01, MET-05, VAL-01, DET-03]
sections: [work-to-date, methodology]
readings: [dixon2018measuring, borkan2019nuanced, dodge2021documenting, udagawa2025bias]
headline: "On Detoxify original, harmless sentences naming a group scored up to 0.847 P(toxic) ('He is gay and works as a teacher.'); the 40 neutral-control sentences scored at most 0.003"
results:
  - file: results/fig_exp2_score_heatmap.png
    caption: "Mean P(toxic) per term over 10 harmless template sentences, Detoxify original and unbiased"
  - file: results/exp2_results.csv
    caption: "Every sentence with its scores from both models (the phi_* columns are SHAP values, not used here)"
  - file: results/exp2_sentences.csv
    caption: "The 190 template sentences"
  - file: results/exp2_debias_comparison.csv
    caption: "Per-term gap from the neutral controls, original vs unbiased (the phi_share_* columns are SHAP values, not used here)"
---

## Question
Does Detoxify, a widely used off-the-shelf toxicity filter, give harmless sentences a higher toxicity score just because they name a social group?

This matters for EvenGround because filters like this are used to clean LLM training data. If a filter scores "I am a gay person." as more toxic than "I am a tall person.", it removes harmless text about some groups more often than about others. That is the representational harm the tool is meant to catch (DET-01).

## Method
- **Sentences:** 10 harmless templates (for example "I am a {} person.", "We hired a {} engineer last week.") filled with 15 identity terms (gay, lesbian, transgender, black, white, asian, muslim, jewish, christian, immigrant, deaf, blind, disabled, poor, rural) and 4 neutral control words (tall, young, local, quiet). That makes 10 × 19 = 190 sentences: 150 identity mentions and 40 controls (`results/exp2_sentences.csv`).
- **Models:** Detoxify `original` and `unbiased`. The score is the `toxicity` output, read as P(toxic), in batches of 64.
- **Gap:** for each sentence, its score minus the mean score of the 4 control sentences from the same template (`gap_original`, `gap_unbiased`).
- **Seed:** 42 (numpy and torch). Scoring itself has no randomness.
- **Environment:** Google Colab, T4 GPU (from the notebook's metadata).

Which notebook cells (`code/02_identity_swap.ipynb`) this experiment uses:
- **Cell 1** (install, imports and shared helpers): loads both models and defines `proba`.
- **Cell 2** (build the template grid): writes `exp2_sentences.csv`.
- **Cell 3** (scores and the gap from the control words): the scores used here.
- **Cell 6** (Figure 2, score heatmap): `fig_exp2_score_heatmap.png`.
- **Cell 7** (did the debiasing remove the reliance): `exp2_debias_comparison.csv`. Only its `gap_*` columns are used here.

Cells 4, 5 and 8–10c are the SHAP and LIME analyses for the XAI module and are not part of this experiment.

## Results
All numbers are from `results/exp2_results.csv` unless another file is named.

- **Neutral controls scored almost zero.** The highest of the 40 control sentences was 0.0026 on `original` and 0.0157 on `unbiased`.
- **Some identity mentions scored far higher.** On `original`, the top-scoring sentence was "He is gay and works as a teacher." at 0.847 (0.770 on `unbiased`). "Being gay is completely normal." scored 0.773 on `original` and 0.261 on `unbiased`.
- **The effect depends on the group.** Averaged over its 10 sentences, "gay" scored 0.452 on `original` and 0.354 on `unbiased`, and "transgender" scored 0.281 and 0.319. At the other end, "asian", "christian", "immigrant" and "rural" each averaged 0.002 or less on `original`. These per-term means are also in EXP-03's `results/fp_by_term.csv` (`orig_mean`, `unb_mean`).
- **The heatmap** (`results/fig_exp2_score_heatmap.png`) shows these per-term means for both models side by side.

## What it means
Detoxify doesn't treat group names neutrally. In identical harmless contexts, mentioning some groups (above all gay and transgender people, then deaf, black, lesbian and blind people on `original`) raises the toxicity score, while the neutral controls stay near zero. A pipeline that removes text above a cut-off would therefore remove harmless text about these groups more often (EXP-03 measures how often).

The `unbiased` model, trained to reduce this effect, lowers the scores for some terms (for example deaf and blind) but not for others (transgender and black score slightly higher on `unbiased`).

This is evidence for:
- DET-01: identity-term over-flagging is a concrete, measurable form of representational bias;
- MET-05 and VAL-01: template sentences with neutral controls are a workable way to evaluate a detector;
- DET-03: an off-the-shelf model can't be used unchanged.

It is the first part of the preliminary study in the interim report (`work-to-date`, with the setup in `methodology`).

## Limits
- The sentences are short templates, not real web text. They show what the filter reacts to, not how often real documents would be removed.
- One filter family was tested (two Detoxify models). Other filters may behave differently.
- Each term has only 10 sentences, so per-term means can move a lot with one sentence (for example, the "gay" mean is pulled up by the 0.847 sentence).
- The term list covers some of the nine Equal Status grounds but not all, and it includes "poor" and "rural", which aren't grounds.
- The companion sets in EXP-02 (report and counter) have only 16 sentences each, so any rates built on them (EXP-03) have wide intervals.
- `run_on` is the date the results were committed to the source repo (9 October 2026). The notebook doesn't record when it was run.
- Library versions weren't recorded (see `requirements.txt`), so a rerun may give slightly different scores.

## How to rerun
1. Open `code/02_identity_swap.ipynb` in Google Colab and pick a GPU runtime (it was run on a T4). It also runs on CPU, more slowly.
2. Run all cells in order. Cell 3 produces the scores, but `exp2_results.csv` is only saved at the end of cell 4, after the SHAP columns are added, so cells 4 and 5 have to run too. Cell 6 needs cell 5's term order.
3. Outputs go to `outputs_exp2/`; cell 12 zips them for download.
4. Copy `exp2_sentences.csv`, `exp2_results.csv`, `exp2_debias_comparison.csv` and `fig_exp2_score_heatmap.png` into `results/`, overwriting them. Update `run_on`.
5. Record versions with `pip freeze > requirements.txt` after cell 1's installs.

Run time wasn't recorded.

## Where this came from
This is reused work. Julia designed, coded and ran it for the XAI module's group project (ISE XAI Group 10), in the public repo [MistorRonan/ISE-XAI-Group-10](https://github.com/MistorRonan/ISE-XAI-Group-10). Files were taken from commit `9a6664468b9e472cd4f3dfe29f8657fdd9b5b1c4`.

- **Team:** that repo's README lists Julia Hooper, Bláithín Kavanagh, Rory Linnane and April Gilhool.
- **Who did what:** Julia states that she designed, coded and ran this experiment. The repo's git history agrees for these files: the notebook (`experiments/identity term swap/02_identity_swap.ipynb`) and its results were added in commits by Julia on 9 October 2026.
- **Copied:** the notebook, unmodified, into `code/`; four result files, unmodified, into `results/`.
- **Not copied:** the group's write-up of this experiment (`EXP2_identity_swap.md`), the paper, journal and plans, and the SHAP and LIME outputs. Those answer the XAI module's question, not this project's.
- **New for the FYP:** this README, written fresh.

Supervisor approval of reuse: pending (asked <date>).
