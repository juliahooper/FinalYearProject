---
id: EXP-01
title: ""
kind: main               # preliminary | main | supporting
status: planned          # planned | running | done
question: ""             # one sentence, ending in a question mark
run_on:                  # YYYY-MM-DD of the run that produced the committed results; empty until run
code_by: julia           # julia | claude | mixed
origin: ""               # empty for new FYP work; otherwise where it came from (see "Where this came from")
reuse_approved:          # only when origin is set: pending | yes | no
depends_on: []           # experiment IDs whose results this one reads
decisions: []            # decision IDs this is evidence for
sections: []             # report section IDs (§3.5) that use it
readings: []             # citekeys of readings that shaped the method
headline: ""             # the one-line result, with numbers; empty until done
results:                 # the outputs worth showing in the app, in display order
  - file: results/example.csv
    caption: ""
---

## Question
What this experiment answers, and why that matters for EvenGround.

## Method
Data, model(s), settings, sample sizes, seed. Enough to rerun it without asking anyone.

## Results
The key numbers, each one taken from a file in results/ (name the file).

## What it means
What the results show, and which decisions or report sections they feed.

## Limits
What the experiment can't show, and what not to overstate.

## How to rerun
Exact commands or notebook steps, environment (laptop or Colab, CPU or GPU) and expected run time if known.

## Where this came from
New FYP work: say so in one line. Reused work: the source repo and commit, the module, who did what, what was changed, and the supervisor's decision on reuse.
