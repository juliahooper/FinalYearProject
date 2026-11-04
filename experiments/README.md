# Experiments

Each experiment is a self-contained folder: a README record (front matter + markdown, like the decisions), the code exactly as it was run, its inputs, and its results. The app shows the README and previews the results; code runs on Julia's laptop or Google Colab, never in the app. See PLAN.md §9.

```
EXP-NN-<slug>/
├── README.md          # the record (copy _template.md)
├── requirements.txt   # exact library versions, or a comment saying why they're unknown
├── code/              # notebooks and scripts, exactly as run
├── data/              # inputs (small files only)
└── results/           # outputs: CSVs, figures. Never edited by hand
```

## Rules

- **IDs** are `EXP-01`, `EXP-02`, … in creation order, never reused. The folder is `EXP-NN-<slug>`, with a kebab-case slug of at most 5 words from the title.
- **Kinds:** `preliminary` (done before the tool exists, to motivate it), `main` (the evaluation that answers the project's questions), `supporting` (training runs, calibration, timing and the like).
- **Write the README first.** Fill in Question and Method with `status: planned` before running anything.
- **Results are never edited by hand.** To change a result, rerun the code, overwrite `results/`, update `run_on`, and commit as `experiments: rerun EXP-NN`. Old results stay in git history.
- **Every number in a README comes from a file in `results/`**, and the README names that file. `headline` too.
- **`status: done`** needs `run_on`, a `headline` and at least one entry in `results`.
- **Sizes:** files up to 5 MB are fine; over 5 MB needs Julia's OK; nothing over 50 MB is committed (point to the original source instead). No PDFs.
- **Provenance:** work reused from outside the FYP sets `origin` and `reuse_approved`, and says who did what in "Where this came from". Other people's writing is never copied.
- `npm run check` validates all of this.

## Index

| ID | Title | Kind | Status | Headline |
|---|---|---|---|---|
| [EXP-01](EXP-01-identity-mentions/) | How an off-the-shelf filter treats harmless identity mentions | preliminary | done | On Detoxify original, harmless sentences naming a group scored up to 0.847 P(toxic); the 40 neutral controls scored at most 0.003 |
| [EXP-02](EXP-02-report-and-counter/) | How an off-the-shelf filter treats reporting and arguing against abuse | preliminary | done | Mean P(toxic) for promoting, reporting and arguing against abuse: 0.88, 0.43, 0.57 (original); 0.96, 0.84, 0.74 (unbiased) |

EXP-01 to EXP-03 together are the preliminary study in the interim report (work to date, with the setup in methodology).
