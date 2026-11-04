# FYP research platform: build plan

**For:** Claude Code (VS Code)
**Owner:** Julia Hooper (24430706), ISE Final Year Project, University of Limerick
**Supervisor:** Colin Venters
**Project:** Screening Training Data for Representational Bias Before LLM Training: A CI-Integrated, Self-Hostable Tool

This file is the spec for setting up this repo and building a small web app on top of it. Work through the stages in order. **Stop at the end of each stage**, summarise what you did, and wait for Julia to confirm before starting the next. If anything in this plan is unclear or contradicts itself, ask instead of guessing.

---

## 0. What this repo is for

One place for everything in the FYP:

- every reading, summarised in the same template and linked to the decisions and report sections it supports
- every architecture and metric decision the project has to make, from open question to final choice
- notes for each section of the report
- the report itself, in LaTeX with the IEEE conference template
- a web app for searching, reading and editing all of the above

**The repo is the only copy of the data.** The app reads and writes markdown and YAML files in this repo through the GitHub API. There is no separate database. Every save in the app is a git commit.

### Deadlines the platform should know about

| Milestone | Date |
|---|---|
| Interim report | 06/11/2026 |
| Final report and video | 07/04/2027 |

**Priority:** the interim report is due 06/11. Stages 1–3 (repo, checks, reading workflow) must be done first, because Julia needs to start summarising readings immediately. The app (stages 4–9) comes after.

### Ground rules for Claude Code

1. **Never invent a citation, author, title, venue, DOI, page number or quote.** If something can't be found in the PDF or `references.bib`, write `NOT FOUND IN SOURCE` and leave it for Julia.
2. Every reading summary you draft has `summarised_by: claude` and `verified: false`. Only Julia sets `verified: true`.
3. Log every file you draft or substantially edit in `ai-use.md` (see §3.9). UL's FYP rules require a detailed declaration of generative AI use, and this log is the evidence for it.
4. PDFs are never committed (publisher copyright). `readings/pdfs/` is in `.gitignore`.
5. Ask before adding any dependency not listed in this plan.
6. One commit per logical change, with messages in the form `area: what changed`, for example `readings: add nangia2020crows` or `app: add star filter`.
7. Write in plain UK English. Use sentence case for headings and UI labels.
8. For anything about course requirements (report structure, marking, deadlines, referencing, ethics, AI rules), check `course-materials/` first and follow it over this plan if they disagree. Tell Julia when they disagree.

---

## 1. Decisions already made

| Topic | Decision |
|---|---|
| Hosting | Private GitHub repo. App deployed on **Vercel** (free tier) from the `app/` folder |
| Data storage | The repo itself, read and written through the GitHub REST API |
| Sign-in | A fine-grained GitHub personal access token (PAT), scoped to this one repo with Contents read/write, pasted into the app once and kept in `localStorage`. There's only one user, so no OAuth server is needed |
| Framework | React + Vite + TypeScript |
| Editor | A **rich text editor** (Tiptap) that reads and writes markdown. Julia doesn't edit raw markdown |
| Visual style | "Reader" style with a **light pink** accent: Inter for the interface, Literata serif for reading text, a different pastel colour for each tag with black text, and pastel yellow stars (see §5) |
| Layout | Three panes: nav sidebar · reading list · reader (see §6.2) |
| Stars | 1–5 for usefulness to this project (0 = not yet rated) |
| Referencing | **UL Cite It Right (Harvard)**, with biblatex in LaTeX |
| Reference manager | Zotero with the Better BibTeX plugin, starting from an empty library |
| Users | Julia only |

---

## 2. Repo layout

```
.
├── README.md                    # project summary (from the proposal) + live status block
├── PLAN.md                      # this file
├── ai-use.md                    # log of generative AI use (§3.9)
├── tags.yml                     # the fixed tag list, with a colour per tag (§3.3)
├── references.bib               # auto-exported from Zotero (§3.7); never hand-edited
├── course-materials/            # UL lecture slides, FYP spec, forms (§3.10)
├── readings/
│   ├── _template.md             # reading template (§3.2)
│   ├── <citekey>.md             # one file per reading, named by its bib key
│   ├── follow-up.yml            # recommended follow-up readings (§7)
│   └── pdfs/                    # git-ignored; Julia drops PDFs here as <citekey>.pdf
├── decisions/
│   ├── _template.md
│   └── <ID>-<slug>.md           # one file per decision, seeded with every open decision (§3.4)
├── experiments/                 # code, inputs and results of every experiment (§9)
│   ├── README.md                # index: what's here, the rules in §9.7, a table of all experiments
│   ├── _template.md             # README template for a new experiment (§9.4)
│   └── EXP-NN-<slug>/
│       ├── README.md            # the experiment record the app shows
│       ├── requirements.txt     # exact library versions, or a comment saying why they're unknown
│       ├── code/                # notebooks and scripts, exactly as run
│       ├── data/                # inputs (small files only; see the size rules in §9.5)
│       └── results/             # outputs: CSVs, figures. Never edited by hand
├── drafts/                      # rough drafts, any format, named YYYY-MM-DD-<topic>.<ext>
├── journal/
│   ├── meetings/                # YYYY-MM-DD.md, supervisor meetings
│   ├── weekly/                  # YYYY-MM-DD-week-N.md
│   └── templates/
├── paper/                       # two reports (§3.6)
│   ├── shared/
│   │   ├── preamble.tex         # IEEEtran conference options, packages, biblatex (UL Harvard), \todo macro
│   │   ├── metadata.tex         # name, student ID, supervisor, project title
│   │   └── figures/             # figures used by either report
│   ├── interim/
│   │   ├── main.tex             # interim report (due 06/11/2026)
│   │   └── sections/*.tex
│   ├── final/
│   │   ├── main.tex             # final report (due 07/04/2027)
│   │   └── sections/*.tex
│   ├── notes/*.md               # report notes edited in the app, one per section ID, shared by both reports (§6.5)
│   └── drafts/                  # dated PDF snapshots: interim-YYYY-MM-DD.pdf, final-YYYY-MM-DD.pdf
├── docs/
│   ├── reading-workflow.md      # how a reading goes from Zotero to verified (shown in the app's Guide page)
│   └── using-the-app.md         # also shown in the Guide page
├── scripts/
│   └── check.mjs                # repo consistency checks (§4)
├── app/                         # the web app (§6)
└── .github/workflows/
    ├── build-paper.yml
    └── check.yml
```

---

## 3. Stage 1: repo scaffold

### 3.1 README

Build the README from Julia's proposal form. Keep it short:

1. **Title**, name, student ID, supervisor.
2. **Introduction** (from the proposal): this project designs, implements and evaluates an open-source, self-hostable tool that scans training data (scraped web content and structured datasets) for representational bias and harmful stereotyping before it enters an LLM training pipeline. The tool runs as a CI/CD step, scores each new source, and accepts or rejects it against developer-configured thresholds. Medical text is the principal case study. The same scanner could help dataset and website publishers self-assess their content before release.
3. **The gap**, in 3–4 bullets:
   - Curation toolkits (NVIDIA NeMo Curator, Dolma, datatrove) do deduplication and toxicity filtering for large one-off pretraining runs. They aren't lightweight per-source gates for small teams.
   - Toxicity filters miss subtler representational bias, such as stereotyped or dismissive descriptions of groups.
   - Governance platforms (Credo AI, Holistic AI) are enterprise products, not open, self-hostable detectors.
   - Bias research mostly examines model outputs (e.g. GenderBench). This project works on the training data upstream.
4. **Aim and objectives**: copy the aim and objectives 1–5 from the proposal word for word.
5. **Milestones table**: copy from the proposal, with the interim date corrected to 06/11/2026.
6. **Status block**, between `<!-- status:start -->` and `<!-- status:end -->`, rewritten by `scripts/check.mjs` (§4). Example:

   > Readings: 12 / 30 · verified: 5 · decisions: 3 decided / 22 open · interim report in 6 days

7. **Repo map**: a table of the folders in §2, one line each.
8. **Links**: the app URL (added in stage 4) and the latest paper PDF.

### 3.2 Reading template (`readings/_template.md`)

The five questions are the per-paper note questions from the Research Methods lecture (29/10/2026, slide 3). The lecture's five FYP framing questions are in the README instead.

```markdown
---
key: nangia2020crows          # = Better BibTeX citekey = filename
title: ""
authors: []                   # ["Nangia, N.", "Vania, C."]
year:
venue: ""
doi: ""
url: ""
stars: 0                      # 0 = not rated, 1–5 = usefulness to this project
status: to-read               # to-read | in-progress | done
tags: []                      # must exist in tags.yml
sections: []                  # report sections this feeds (§3.5)
decisions: []                 # decision IDs this informs, e.g. [MET-02, VAL-01]
summarised_by: claude         # claude | julia
verified: false               # set to true only by Julia, after checking against the PDF
added: 2026-10-31
found_via: ""                 # e.g. IEEE Xplore search "representational bias dataset", cited in X
---

## TL;DR
Two or three sentences: what the paper did, what it found, and why it matters to this project.

## 1. What is the aim of the paper?
The problem the paper tackles, its scope, and what it set out to do.

## 2. How did the authors carry out the research?
Method: data, models, setup, metrics, sample sizes.

## 3. What are the primary results?
The key results, with numbers.

## 4. What do the authors think the results mean?
The authors' own interpretation of their results, in relation to the aim (question 1).

## 5. What do I think it means?
Your own view: how this supports, challenges or shapes the tool. Name the decision IDs and report sections it feeds. If Claude drafted this, rewrite it in your own words when you verify.

## Key numbers
- Figures worth citing, each with its page number (p. X).

## Concerns
Limitations, narrow data, things not to overstate.

## Follow-up
Papers cited here that are worth reading next.
```

### 3.3 Tags (`tags.yml`)

Tags come only from this list. The app's tag picker offers these and can append new ones. Each tag has its own pastel background, and **all tag text is black** (`#1F1B1E`).

```yaml
# group: project area   (all tags use black text: fg "#1F1B1E")
- id: architecture   ; label: Architecture   ; bg: "#ECE6FB"
- id: metrics        ; label: Metrics        ; bg: "#FCE4EE"
- id: detector-model ; label: Detector model ; bg: "#FFE9F6"
- id: ci-cd          ; label: CI/CD          ; bg: "#E1EFFB"
- id: medical        ; label: Medical        ; bg: "#DFF4EA"
- id: benchmarks     ; label: Benchmarks     ; bg: "#FDE8D8"
- id: governance     ; label: Governance     ; bg: "#E6F3F5"
- id: usability      ; label: Usability      ; bg: "#FBF3CF"
- id: ethics         ; label: Ethics         ; bg: "#F1ECE4"
- id: data-curation  ; label: Data curation  ; bg: "#EAF0DC"
- id: impact-evaluation ; label: Impact evaluation ; bg: "#F3E5FC"   # added 2026-11-01 (first spare palette colour)
```

The `;` lines above are shorthand. Write the real file as proper YAML: a list of maps with `id`, `label`, `group` and `bg` keys. Text colour is always black, so there's no per-tag `fg`.

For tags added later, the app takes the next unused pastel from this palette (and cycles if it runs out):
`#F3E5FC`, `#E3F4F8`, `#FDEBD5`, `#E8EEFC`, `#FCE7E2`, `#E5F5E0`.

Every background must give black text at least WCAG AA contrast (4.5:1). Check this in `scripts/check.mjs`.

### 3.4 Decisions (`decisions/`)

Seed one file for **every** decision below, all with `status: open`. Julia fills them in as she goes. The app's Decisions page (§6.4) is built from these files.

**Template:**

```markdown
---
id: MET-02
title: Per-item bias score
group: metrics          # system | detector | metrics | ci-cd | reporting | validation | evaluation | governance
status: open            # open | exploring | decided
decided_on:             # YYYY-MM-DD
readings: []            # citekeys that inform this decision
---

## Question
The one question this decision answers.

## Options considered
- **Option A**: summary; pros; cons; supporting readings
- **Option B**: ...

## Decision
(empty until decided)

## Why
(empty until decided; cite readings by key)

## Consequences
What this decision commits the project to, or rules out.
```

**Seed list.** Each line gives the ID and title, then the question to put in the Question section:

**System design (`group: system`)**
- `ARCH-01` User flow: how a developer adds the tool to a pipeline, runs it, and acts on the result.
- `ARCH-02` System flow: the components and how data moves through them, from ingestion to score, gate decision and report.
- `ARCH-03` Input formats and ingestion: which source types are supported (web pages, JSONL, CSV, Hugging Face datasets), and how they're loaded.
- `ARCH-04` Unit of scoring: whether scoring happens per document, chunk or sentence, and how text is chunked.
- `ARCH-05` Tech stack: language, libraries and packaging.
- `ARCH-06` Deployment and self-hosting: CLI, Docker image, hardware needs, and how the local model is shipped.
- `ARCH-07` Configuration: the format for thresholds and backend choice, and where the config file lives.

**Detector (`group: detector`)**
- `DET-01` Definition of representational bias: the working definition and taxonomy the tool detects.
- `DET-02` Local base model: which small open-weight model to fine-tune, and why.
- `DET-03` Fine-tuning method and training data: method (e.g. LoRA) and which labelled data.
- `DET-04` Commercial API backend: which API, and how prompts and outputs are structured.
- `DET-05` Ensemble mode: how backends are combined, and what counts as a disagreement that's sent for human review.
- `DET-06` Labelling scheme: the label set and guidelines for the medical sample.

**Metrics (`group: metrics`)**
- `MET-01` Bias categories covered: which groups and bias types (gender, race, age, disability, etc.).
- `MET-02` Per-item bias score: what is scored and on what scale.
- `MET-03` Aggregation to a source score: how item scores combine into one score per source.
- `MET-04` Thresholds and gate logic: default thresholds, accept/reject/review rules.
- `MET-05` Detector evaluation metrics: e.g. precision, recall, F1, calibration, per-category breakdown.
- `MET-06` Backend comparison metrics: accuracy, cost per 1,000 items, latency, privacy.

**CI/CD (`group: ci-cd`)**
- `CI-01` Integration point: GitHub Action, pre-commit hook, CLI in any CI, or several of these.
- `CI-02` Pass/fail and override behaviour: what blocks a merge, and how a developer overrides with a reason.
- `CI-03` Performance budget: acceptable run time and cost per CI run.

**Reporting (`group: reporting`)**
- `UI-01` Report format for non-technical staff: HTML, markdown or PR comment, and what it shows.
- `UI-02` Explanation of flagged items: how each flag is explained (highlighted span, category, reason).

**Validation (`group: validation`)**
- `VAL-01` Benchmark datasets: e.g. StereoSet and CrowS-Pairs, with their licences and known weaknesses.
- `VAL-02` Medical labelled sample: size, sourcing, who labels it, and agreement checks.
- `VAL-03` Usability evaluation method: readability measures, heuristic evaluation, cognitive walkthrough, and who takes part.

**Impact evaluation (`group: evaluation`)**, added 2026-11-01. VAL-* asks whether the detector is accurate. EVAL-* asks whether acting on the tool's decisions changes a trained model's output, how the tool itself is tested, and how the results are reflected on.
- `EVAL-01` Downstream impact experiment: how to show that acting on the tool's accept/reject decisions changes a trained model's behaviour (e.g. a small model trained on unfiltered vs filtered versions of the same corpus), including model, corpus and compute.
- `EVAL-02` Output bias measures: which output-side benchmarks and metrics compare the models before and after (e.g. StereoSet, CrowS-Pairs, GenderBench, template-based tests), for which categories, and for the medical case study.
- `EVAL-03` Controls and statistics: baselines (no filtering, random removal of the same amount of data, an existing toxicity or quality filter), data volume and seed control, and statistical tests.
- `EVAL-04` Attribution and explanation tests: whether post-hoc attribution (e.g. SHAP, LIME) or training-data attribution links output changes to removed sources, and how faithfulness is checked.
- `EVAL-05` Tool test suite: unit, integration and regression tests (on fixed labelled examples) for the scanner, gate and report, run in CI.
- `EVAL-06` Post-implementation reflection: what changed, side effects (such as removing useful text by or about minority groups), threats to validity, and what it means for the recommendations.

**Governance (`group: governance`)**
- `ETH-01` Ethics position: whether any part involves human participants (VAL-02 labelling, VAL-03 evaluators), and if so, the UL Science & Engineering expedited application. Lead time is 4–6+ weeks, and the committee deadline is the first Thursday of each month.
- `ETH-02` Data licensing and use: licences of every dataset used, and how the tool handles data it scans.

### 3.5 Report sections

These IDs are used in `sections:` in readings, in `paper/interim/sections/` and `paper/final/sections/`, and in `paper/notes/`. They follow the FYP marking guide. The order below is the order in each report.

| ID | Section | Reports | Marks |
|---|---|---|---|
| `abstract` | Abstract | interim, final | – |
| `introduction` | Introduction: problem, research question, objectives, expected impact | interim, final | 10 |
| `background` | Literature review: background ("who said it's a problem") | interim, final | 20 (shared with related-work) |
| `related-work` | Literature review: related work and the gap | interim, final | (shared) |
| `methodology` | Methodology: approach, ethics, practical considerations (interim: the proposed approach, architecture, metrics and validation plan) | interim, final | 10 |
| `work-to-date` | Work to date: what has been done so far, with evidence | interim | – |
| `project-plan` | Project plan: remaining work, timeline to April 2027, risks | interim | – |
| `deliverable` | Primary research / deliverable: the tool (design and implementation) | final | 25 (shared with evaluation) |
| `evaluation` | Evaluation: test suite, downstream impact on trained models, attribution tests, post-implementation reflection (EVAL-*) | final | (shared) |
| `analysis` | Analysis | final | 10 |
| `conclusion` | Summary, conclusions, recommendations, future work | final | 10 |

Both reports also end with `declarations.tex` (academic integrity and generative AI). It has no section ID, because readings don't feed it and it has no notes file.

The marks come from the spec's marking guide, which isn't labelled as interim or final, and whose rubric is headed "Residency 4" (the module the final report is submitted under). Check with Colin which marking scheme applies to the interim report.

### 3.6 Paper (`paper/`)

- **Two reports**, as two separate LaTeX documents:
  - **Interim report** (`paper/interim/`, due 06/11/2026). IEEE conference format. It covers work done so far and the research. It follows the final report's structure without the results sections (deliverable, evaluation, analysis, conclusion), and adds `work-to-date` and `project-plan`. The impact evaluation plan (EVAL-*) goes in the interim methodology.
  - **Final report** (`paper/final/`, due 07/04/2027).

  Both `main.tex` files `\input` `../shared/preamble` and `../shared/metadata`, use `../../references.bib`, and end with `sections/declarations.tex`.
- **Section text is never shared between the reports with `\input`.** The interim text will be revised for the final report. After the interim is submitted, Julia will ask Claude Code to copy `interim/sections/` into `final/sections/` as a starting point.
- Base the template on `paper/` from Julia's earlier repo (ISE-XAI-Group-10): IEEEtran `conference`, one `\input` per section file, and a `\todo{}` macro. At the top of each section file, add a comment block listing what the marking guide and rubric expect in that section. Interim-only sections also explain what an examiner looks for in "evidence of work done to date". Section bodies stay as `\todo{}` placeholders; Claude Code doesn't write report text.
- **Referencing is UL Cite It Right (Harvard), not IEEE numbered.** Use `biblatex` with `backend=biber, style=authoryear` in `shared/preamble.tex`, plus `\addbibresource{../../references.bib}` in each `main.tex`. Adjust the style to match the UL guide as closely as biblatex allows:
  - in-text citations as (Author Year) and (Author Year, p. X)
  - "et al." for 3+ authors in text
  - online sources end with "available: URL [accessed DD Mon YYYY]"

  Write a short `paper/REFERENCING.md` explaining any differences that remain from the official UL guide, so Julia can check with Colin.
- Use `\textcite` / `\parencite` in the section files.
- `.github/workflows/build-paper.yml` (based on the old repo's) builds both PDFs with latexmk and biber, and uploads them as two artifacts, `interim-pdf` and `final-pdf`. It only rebuilds the report whose folder changed. A change to `paper/shared/`, `references.bib`, the word count script or the workflow rebuilds both.
- **Word count:** `scripts/wordcount.sh` runs in the Action and prints each report's count on the run's Summary page. The body is counted with texcount. The total, including references, is counted from the PDF text, because texcount can't count a biblatex bibliography. Declarations are left out. Limits: the final report has 10,000 words including references (FYP spec); the interim limit is to be confirmed with the supervisor.
- `paper/drafts/README.md` explains how to save dated PDF snapshots, named `interim-YYYY-MM-DD.pdf` or `final-YYYY-MM-DD.pdf`.

### 3.7 Zotero setup (`docs/reading-workflow.md`, part 1)

Write step-by-step instructions for Julia:

1. Install Zotero and the Better BibTeX plugin.
2. Set the citation key formula to `auth.lower + year + shorttitle(1,0).lower` (gives e.g. `nangia2020crows`).
3. Create a collection called "FYP".
4. Right-click the collection, choose Export, and pick format **Better BibLaTeX** with **Keep updated** ticked. Save to the repo root as `references.bib`.
5. Add papers with the Zotero browser connector, from IEEE Xplore, ACM DL, Google Scholar or arXiv.
6. Save each PDF as `readings/pdfs/<citekey>.pdf`.

### 3.8 Journal and drafts

- Copy the meeting and weekly templates from the old repo into `journal/templates/`, rewritten for a solo project with a supervisor (no "who did what" table).
- `drafts/README.md`: name files `YYYY-MM-DD-<topic>.<ext>`. Any format is allowed. Drafts are never referenced by the paper build.

### 3.9 AI-use log (`ai-use.md`)

UL's FYP rules allow generative AI only with the supervisor's written permission by email. The report must include that email exchange and a detailed declaration of which AI was used, how, and for what. Structure the file as:

1. **Permission**: a placeholder where Julia pastes, or links to, Colin's email permission.
2. **Tools used**: Claude Code (model and version), and what it's used for.
3. **Log table** with these columns: Date, File, What the AI did (drafted / edited / checked), Verified by Julia (date).

Add a row every time you draft or substantially edit a file.

### 3.10 Course materials (`course-materials/`)

A folder where Julia drops lecture slides, the FYP specification, supervisor information and forms, so Claude Code can read them.

```
course-materials/
├── README.md        # what's here and how it's used
├── spec/            # FYP specification, marking guide, rubric, supervisor information
├── lectures/        # lecture slides, named YYYY-MM-DD-<topic>.pdf (e.g. 2026-10-29-research-methods-prequel.pdf)
├── forms/           # proposal form, ethics forms, declarations
└── notes/           # Julia's own notes from lectures (markdown)
```

- `README.md` lists each file with its date and a one-line summary. Claude Code updates the list whenever new files appear.
- These are UL course materials: fine in a private repo, but the app never displays them and they're never published.
- When there are conflicting versions of the same document (e.g. two spec PDFs with different dates), the most recent wins. Note the difference in the README. The submission dates changed during the semester; the current ones are interim 06/11/2026 and final 07/04/2027.
- Claude Code reads this folder when writing the "What this section needs" boxes (§6.5), the README, the paper section comments (§3.6) and the Guide page (§6.6).

**Stage 1 is done when:** every folder and template in §2 exists (including `course-materials/` with its README), the README is written, all 25 decision files are seeded (29 in the end; see the seed list), `paper/` builds to a PDF in the Action (now two PDFs, interim and final), and `docs/reading-workflow.md` covers Zotero setup.

---

## 4. Stage 2: checks (`scripts/check.mjs` + `.github/workflows/check.yml`)

A Node script (no extra dependencies beyond `yaml` and a small bib parser such as `@retorquere/bibtex-parser`) that:

1. Parses every `readings/*.md` front matter and validates it against the schema in §3.2. It fails on unknown fields, bad enum values, or tags missing from `tags.yml`.
2. Checks every `decisions:` ID in readings exists in `decisions/`, and every `readings:` key in decisions exists in `readings/`.
3. Cross-checks `references.bib` against `readings/`:
   - Every bib key without a reading note → warning ("in Zotero, not summarised yet").
   - Every reading without a bib key → error.
   - Bib entries without a DOI or URL → warning.
4. Checks that black text on every tag colour passes WCAG AA.
5. Writes `app/public/status.json` with counts:
   - readings by status and by star rating
   - verified count
   - readings per tag, report section and decision
   - decisions by status and group
6. Rewrites the README status block (§3.1). The countdown names the interim report up to and including 06/11/2026, then the final report and video.
7. Validates experiments (§9.5 Step 5):
   - parses `experiments/*/README.md` front matter against §9.4; fails on unknown fields, bad enum values, an `id` that doesn't match the folder's `EXP-NN` prefix, or a duplicate ID;
   - every `decisions`, `sections` and `depends_on` value exists (error); every `readings` citekey exists (warning);
   - every `results[].file` exists inside that experiment's folder;
   - `status: done` needs `run_on`, a non-empty `headline` and at least one `results` entry;
   - a non-empty `origin` needs `reuse_approved`: `pending` is a warning, `no` is an error;
   - no file under `experiments/` is over 50 MB (error) or 5 MB (warning), and there are no PDFs;
   - `status.json` gains `experiments: { total, byStatus, byKind, reusePending }`, and the README status block gains `· experiments: N done`.

   `npm test` runs `scripts/check.test.mjs`, which checks that a deliberately broken experiment (a bad decision ID) fails.

The workflow runs the script on every push. It commits README changes back only when the status block changed, with the message `chore: update status`, using `[skip ci]` to avoid loops.

**Stage 2 is done when:** the check passes on a clean repo and fails with a clear message on a deliberately broken reading.

---

## 5. Visual design (used from stage 4)

Reader style with a pink accent. Interface text is Inter, and reading text (summaries, notes, editor body) is Literata. Both load from Google Fonts with fallback stacks.

```css
:root {
  --bg: #FFFFFF;        /* page */
  --side: #F6F4F6;      /* sidebar */
  --sel: #FDF0F5;       /* selected row / nav item (very light pink) */
  --line: #ECE6EA;      /* hairlines */
  --fg: #1F1B1E;        /* text */
  --mut: #76707A;       /* secondary text */
  --acc: #F29BBE;       /* light pink accent: buttons, selected markers, progress bars */
  --acc-fg: #1F1B1E;    /* text on the pink accent is dark, since white fails contrast on light pink */
  --acc-text: #B8457A;  /* deeper pink for pink text (question labels, links), so it stays readable */
  --star: #F7DC7A;      /* pastel yellow, filled star */
  --star-off: #ECE6EA;  /* unfilled star */
  --tag-fg: #1F1B1E;    /* all tag text */
  --ok: #2F7D4F; --warn: #A86A00; --err: #B3261E;
  --font-ui: "Inter", system-ui, sans-serif;
  --font-read: "Literata", Georgia, serif;
}
/* dark mode via prefers-color-scheme plus a manual toggle (data-theme) */
--bg: #17151A; --side: #121014; --sel: #3A2530; --line: #2C2730;
--fg: #EEEAF0; --mut: #A39CA8; --acc: #F29BBE; --acc-fg: #1F1B1E; --acc-text: #F5AECB;
--star: #F7DC7A; --star-off: #3A3440;
```

**Final UI pass (2026-11-02):** the look stays simple, but it is slightly more colourful. The sidebar background becomes `#FAF5F8` (pink-tinted), and these tokens are added:

```css
--pastel-pink: #FCE4EE; --pastel-lavender: #ECE6FB; --pastel-mint: #DFF4EA;
--pastel-peach: #FDE8D8; --pastel-butter: #FBF3CF; --pastel-sky: #E1EFFB;  /* same as tags.yml */
--edge-*: deeper tone of each pastel, for borders and left edges
--shadow-soft: 0 1px 2px rgba(31,27,30,.04), 0 4px 14px rgba(31,27,30,.06);
--radius-lg: 12px;
/* dark mode: each pastel becomes a muted dark tint, e.g. lavender #2E2638 */
```

- Tag pills use their pastel from `tags.yml` with black text, in both light and dark mode, so tags look the same everywhere.
- Base size 14px for the interface and 15px/1.6 for reading text. Keep reading lines around 65–70 characters wide.
- Radius 8–12px: 12px for cards, menus and dialogs, and 10px for buttons, inputs and list rows.
- Borders are mostly hairlines. A very soft shadow (`--shadow-soft`) is allowed only on raised things: the selected nav and list item, the active tab, open accordion items, dropdowns, menus, dialogs and the sign-in card.
- Pink is the main accent. Use it on primary buttons, selected markers (a 3px left bar), progress bars, question labels (pink text with a small pink square) and links. Use `--acc` for pink fills and `--acc-text` whenever pink is used as text.
- The supporting pastels add colour without carrying meaning:
  - Dashboard stat cards each get a pastel background with a darker left edge.
  - List group headings are lavender chips, with their count on the right.
  - The "What this section needs" box is a butter callout.
  - Table header rows are lavender.
  - Sidebar nav icons sit in small pastel tiles.
  Text on a pastel is always `--fg`.
- Page titles (`.page-title`) have a short pink-to-lavender bar underneath. Tabs are a segmented control.
- Stars are ★ glyphs, filled in pastel yellow (`--star`) and unfilled in `--star-off`. Give filled stars a 1px `--line`-coloured outline (via `-webkit-text-stroke` or an SVG star) so pastel yellow still reads on white.
- Status is shown as a small pill and, in the readings list, a heart: to-read (light pink), in-progress (light yellow), done (light green, with a tick on the pill). Choosing done marks the reading as verified.
- Sentence case everywhere. No emoji.

---

## 6. The app (stages 4–9)

### 6.1 Stage 4: foundation

- Scaffold `app/` with Vite + React + TypeScript.
- **Dependencies:**
  - `react-router-dom`
  - `@octokit/rest`
  - `yaml`
  - `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-table` (+ row/cell/header) and `tiptap-markdown`
  - `minisearch`
  - `idb-keyval`
  - `mermaid` (diagrams in reading notes), `katex` (formulas in reading notes) and `vitest` (dev only, for the round-trip tests). Approved by Julia on 2026-11-01.
  - `markdown-it` (view-mode rendering; the same copy `tiptap-markdown` uses). Approved by Julia on 2026-11-01.
  - Supporting packages these need: `@tiptap/pm` (Tiptap's required companion package), and dev only `jsdom` (runs the editor in tests) and `@types/markdown-it`.

  The Vite template also brings its own build tooling (`typescript`, `@vitejs/plugin-react`, `oxlint`). Ask before adding anything else.
- **Sign-in screen:** explains how to create a fine-grained PAT (only this repo; Contents: read and write; Metadata: read), with a field to paste it. The token is stored in `localStorage` and verified with a test API call. "Sign out" clears it. The repo owner, name and branch are set in `app/src/config.ts`.
- **Data layer** (`app/src/data/`):
  - On load, fetch the repo tree recursively (`git/trees/{branch}?recursive=1`), then the contents of `readings/*.md`, `readings/follow-up.yml`, `decisions/*.md`, `paper/notes/*.md`, `tags.yml`, `docs/*.md` and `app/public/status.json`.
  - Cache contents and SHAs in IndexedDB, so the next load uses the cache and only refetches files whose SHA changed.
  - Parse front matter with `yaml`, and split it from the body.
  - **Save** = `PUT /repos/{owner}/{repo}/contents/{path}` with the file's last known SHA and commit message `app: update <path>`. If the SHA is stale (409/422), show a conflict banner: "This file changed on GitHub since you opened it. Reload it to see the latest version, or copy your text first." Never overwrite silently.
  - Saving is explicit, through a Save button or Ctrl/Cmd+S. Unsaved edits are kept as a local draft in IndexedDB and restored on reload, with a "you have unsaved changes" indicator.
- **Routing:** `BrowserRouter`, plus a `vercel.json` rewrite of all paths to `index.html`.
- **Deploy:** Vercel project with root directory `app/`, build `npm run build`, output `dist`. Write the steps in `docs/using-the-app.md`. Add a Vercel password or deployment protection note: optional, because the site holds no data until a token is entered.
- Apply the design tokens from §5 and build the app shell (§6.2) with empty pages.

**Done when:** the app deploys on Vercel, sign-in works, and the shell shows the real reading count from the repo.

### 6.2 Layout

The layout has three panes:

```
┌────────────┬─────────────────────────┬──────────────────────────────────┐
│ Sidebar    │ List                    │ Reader / editor                  │
│ 150px      │ ~300px                  │ remaining width                  │
│            │                         │                                  │
│ FYP        │ [Search 24 readings   ] │ Nangia et al. · EMNLP 2020  [Edit]│
│ Dashboard  │ [Tags ▾][Stars ▾][Status▾][Decision▾][Section▾] [Sort ▾] │
│ Readings ● │ ┌─────────────────────┐ │ CrowS-Pairs: a challenge dataset │
│ Report     │ │ CrowS-Pairs         │ │ ★★★★★ [metrics][benchmarks] MET-02│
│  notes     │ │ ★★★★★ Nangia 2020   │ │                                  │
│ Decisions  │ │ [metrics][benchmarks]│ │ 1 · What is the aim of the paper?│
│ Guide      │ └─────────────────────┘ │ Masked language models absorb…   │
│            │  StereoSet …            │                                  │
│ ─────      │  Dolma …                │ 2 · How did the authors carry …  │
│ Sign out   │                         │ …                                │
└────────────┴─────────────────────────┴──────────────────────────────────┘
```

- **Sidebar** (all pages): app name; nav items Dashboard, Readings, Report notes, Decisions and Guide, each with an icon; the selected item uses the `--sel` background. At the bottom: theme toggle and sign out.
- **List pane:** used on Readings, Report notes and Decisions.
  - On Readings, each item shows the title (without the subtitle after a colon), stars, first author and year, and its tag pills. The selected item uses `--sel`.
  - Filters sit above the list as dropdown chips, and active filters show as removable pills.
- **Reader pane:** shows the selected item. An **expand** button hides the list pane, for long reading or editing sessions.
- **Phone width** (under 768px): one pane at a time, with a back arrow, and the sidebar becomes a bottom bar.
- The URL reflects the selection (`/readings/nangia2020crows`), so links and the back button work.

### 6.3 Stage 5: Readings (features 10 and 11)

**List and search**

- Full-text search with MiniSearch over title, authors, TL;DR and the five answers. Results are ranked, and the matched terms are highlighted in the list.
- **Filters** (all combinable):
  - tags (multi-select, with colour dots)
  - minimum stars
  - status
  - decision (multi)
  - report section (multi)
  - verified yes/no
- **Sort:** stars, year, date added, or title.
- Show a count above the list: "12 readings · 3 filters".
- Filters persist in the URL query string.

**Reader view**

- Header: authors · venue · year, the title in Literata, stars, tag pills, decision chips (each links to the decision) and section chips. A DOI/URL link opens the paper.
- Body: sections in template order. Question labels are small and in `--acc-text` pink, and the answers are in Literata.
- No unverified banner (removed at Julia's request, 2026-11-01). Verifying is done by choosing **Verified** in the status menu, which sets `verified: true` and `status: verified`, fills in the date in `ai-use.md`, and saves. Unverified readings are marked with a small dot in the list.

**Editing** (rich text, never raw markdown)

- **Edit** switches the reader to edit mode:
  - Metadata fields become controls:
    - star picker (click to set, click again to clear)
    - tag picker from `tags.yml` with colours, plus "Add new tag", which appends to `tags.yml` with the next palette colour
    - multi-selects for decisions and sections
    - status dropdown
  - The body becomes a Tiptap editor, set in Literata. The toolbar has bold, italic, heading levels 2–3, bullet and numbered lists, link, table and undo/redo. Show the toolbar only in edit mode.
  - Markdown must round-trip cleanly. Write tests showing that headings, lists, bold, italic, links, tables, `(p. X)` and inline code survive load → edit → save unchanged when nothing was edited.
- **Stars and status can also be set in view mode**, without entering edit mode. That saves straight away.
**To read next** (from `readings/follow-up.yml`)

- A "To read next" view in the Readings list pane, as a tab or toggle next to the readings list. It shows suggested follow-ups grouped by priority (high, medium, low). Each item shows the title, first author and year, the venue, the "why" line, and "found in" links to the readings that recommended it.
- Each item has two buttons. **Saved to Zotero** asks for the citekey (from a dropdown of bib keys) and sets `status: saved` and `key`. **Skip** sets `status: skipped`. Both save to `follow-up.yml`. Saved and skipped items are hidden behind a "Show done" toggle.
- Items whose details say `NOT FOUND IN SOURCE` show a "find this paper" hint instead of a venue.
- A reading's reader view lists the follow-ups it recommended, under its Follow-up section.

- **New reading** button: asks for a citekey from `references.bib` (searchable dropdown of keys without a note yet), prefills title, authors, year, venue and DOI from the bib entry, then creates the file from `_template.md`.

### 6.4 Stage 6: Decisions (feature 13)

- The list pane groups decisions under their headings (System design, Detector, Metrics, CI/CD, Reporting, Validation, Impact evaluation, Governance), with counts such as "Metrics · 1 / 6 decided".
- Each decision shows as a **collapsible section** (accordion).
  - **Collapsed:** ID, title and status pill (open / exploring / decided).
  - **Expanded:** Question, Options considered, Decision, Why and Consequences, all editable in the same rich text editor, plus a "Readings" panel.
    - The Readings panel lists every reading whose `decisions:` includes this ID, combined with the decision's own `readings:` list. Each one shows stars and TL;DR, and links to the reading.
    - "Link a reading" adds it to both files.
  - Changing status to "decided" sets `decided_on` to today.
- **New decision** button: pick a group, and the next ID is assigned automatically.
- At the top of the page, a progress bar shows decided decisions out of the total.

### 6.5 Stage 7: Report notes (feature 12)

- An **Interim / Final** switch at the top of the list pane chooses the report. The list then shows only that report's sections from §3.5, in report order. Each shows its marks weight, the word count of its notes, and the number of tagged readings. Interim-only sections (`work-to-date`, `project-plan`) show no marks weight. The switch defaults to the report whose deadline is next, and the choice is kept in the URL (e.g. `/notes/interim/methodology`).
- Notes are shared: `paper/notes/<section>.md` is the same file whichever report is selected, so notes written for the interim carry over to the final report.
- The reader pane shows a rich text editor (Literata) for `paper/notes/<section>.md`. Saving works as in §6.1. These notes are rough working notes, kept apart from the `.tex` files so they can never break the paper build.
- A **side panel** on the right (collapsible) lists readings whose `sections:` include this section, sorted by stars. Each reading has:
  - **Cite**: inserts `\parencite{key}` at the cursor
  - **Copy cite**: copies `\textcite{key}`
  - **Open**: opens the reading in the reader
- At the top, a collapsible "What this section needs" box, taken from the marking guide and rubric in `course-materials/spec/` for that section.

### 6.6 Stage 8: Dashboard and Guide

**Dashboard** (built from `status.json`, recomputed in the browser when the live data is newer)

- **Countdown** to the next deadline. It shows the interim report (06/11/2026) up to and including 06/11/2026 ("due today" on the day), then switches to the final report and video (07/04/2027). The README status block (§4) follows the same rule.
- **Sources:** a progress bar toward 30, showing done / in progress / to read.
- **Decisions:** decided / exploring / open, by group, linking to the Decisions page.
- **Coverage:** readings per report section and per tag as a small bar chart, with sections that have fewer than 3 readings highlighted as gaps.
- **Star distribution.**
- **To do:** bib entries without a reading note, unverified Claude summaries, decisions still open, and high-priority follow-up readings not yet saved (linking to "To read next").
- **Recently edited:** the last 5 changes, from the commits API.

**Guide page** (Julia asked for the reading workflow to be visible in the app)

- Renders `docs/reading-workflow.md` and `docs/using-the-app.md` from the repo, with a table of contents.
- `docs/reading-workflow.md` covers the whole process:
  1. Find a paper: databases from the FYP lectures (IEEE Xplore, ACM DL, Scopus, Google Scholar, arXiv), and the CORE rankings for judging conference quality.
  2. Save it to Zotero (§3.7). The PDF goes to `readings/pdfs/<citekey>.pdf`.
  3. Ask Claude Code to summarise it, using the exact prompt from §7 (shown in a copy box).
  4. Read Claude's draft against the PDF. Fix anything wrong and check every number and page reference.
  5. Set stars, tags, sections and decisions.
  6. Mark as verified. Add the verification date to `ai-use.md`.
  7. Skim-reading tip from the lecture: read the abstract and conclusion first, answer what you can, then skim the rest for the remaining questions.

### 6.7 Stage 9: polish

- Dark mode and the theme toggle.
- Phone layout.
- Keyboard focus states.
- `prefers-reduced-motion`.
- Empty states that explain what will appear and how to add the first item, e.g. "No readings yet. Add a paper to Zotero, then click New reading."
- Error messages that say what went wrong and how to fix it, e.g. "Your GitHub token has expired. Create a new one and paste it here."
- Loading skeletons.
- A Lighthouse accessibility score of at least 95.

---

## 7. Stage 3: reading workflow (Claude Code's job)

When Julia says "summarise `<citekey>`" or "summarise new readings":

1. Find `readings/pdfs/<citekey>.pdf` and its entry in `references.bib`. If either is missing, stop and say which.
2. Read the whole PDF.
3. Create `readings/<citekey>.md` from `_template.md`:
   - Front matter: copy title, authors, year, venue and DOI from the bib entry, not from memory. Set `summarised_by: claude`, `verified: false`, `status: to-read`, `stars: 0` and `added: today`.
   - Suggest `tags`, `sections` and `decisions` using only values that exist in `tags.yml`, §3.5 and `decisions/`. Explain each suggestion in one line under "5. What do I think it means?".
   - Answer the five questions **about the paper**, in plain language, in your own words. Use at most one direct quote per reading, under 15 words, with a page number.
   - Under "Key numbers", give every figure with its page number. If you can't find a page number, write `(p. ?)`.
   - Write `NOT FOUND IN SOURCE` rather than guessing.
   - **Style.** Reading notes are for Julia only, so make them memorable. Use interesting metaphors, real-world examples and use cases, colourful Mermaid diagrams wherever they help (pastel `classDef` fills from §3.3 with black text), and the paper's formulas in LaTeX math (`$$...$$`). Label anything that isn't from the paper, such as an analogy, a made-up example or toy numbers, with **Analogy:** or **Illustrative, not from the paper:**, so it never gets cited in the report. Diagrams of the paper's results must use the paper's own numbers.
   - If the bib entry has Julia's Zotero notes (exported with "Export notes"), read them first. Use them to shape question 5 ("What do I think it means?") and the suggested tags, sections and decisions, and to decide what to emphasise. Notes are Julia's views, not the paper's: never present them as what the paper says, and say in the chat report where the draft differs from them.
4. Add the citekey to the `readings:` list of each suggested decision file. Add each paper recommended under "Follow-up" to `readings/follow-up.yml`, with the details copied exactly as printed in the reference list and the page number. If it's already listed, add this reading to its `found_in` instead.
5. Add a row to `ai-use.md`.
6. Run `node scripts/check.mjs` and fix any errors.
7. Commit as `readings: add <citekey> (claude draft, unverified)`.
8. Report back in chat:
   - a two-line summary
   - suggested star rating with a reason (Julia sets the real one)
   - anything you were unsure about
   - follow-up papers worth reading

**Pilot first:** for the first three readings, stop after each one so Julia can check the format before doing more in a batch.

The copyable prompt for the Guide page:

> Summarise the reading `<citekey>` following §7 of PLAN.md. The PDF is in readings/pdfs/. Don't guess anything that isn't in the PDF.

**Stage 3 is done when:** three pilot readings have been summarised, Julia has approved the format, and the check passes.

---

## 8. Stage order and checkpoints

| Stage | What | Needed for interim (06/11)? |
|---|---|---|
| 1 | Repo scaffold, README, templates, decisions seeded, paper builds | Yes |
| 2 | Check script + Action + README status | Yes |
| 3 | Reading workflow + 3 pilot readings | Yes |
| 4 | App foundation, sign-in, data layer, deploy on Vercel | Nice to have |
| 5 | Readings: list, search, filters, reader, rich text editing | Nice to have |
| 6 | Decisions page | Nice to have |
| 7 | Report notes | After interim |
| 8 | Dashboard + Guide | After interim |
| 9 | Polish | After interim |
| 10a | Experiments folder, EXP-01 to EXP-03, checks (§9.5) | Yes: evidence for the preliminary study |
| 10b | Experiments page (§9.6) | After interim |
| 10c | Links from Decisions, Report notes, Dashboard; Guide page (§9.7) | After interim |

At the end of every stage:
1. Summarise what changed and how to try it.
2. List anything left undone or any assumptions you made.
3. Wait for Julia's go-ahead before starting the next stage.

---

## 9. Stage 10: Experiments

Every ground rule in §0 applies here, in particular:

- never invent a number, citation or version;
- log every file you draft or substantially edit in `ai-use.md`;
- ask before adding any dependency;
- make one commit per logical change, with messages in the form `area: what changed`;
- stop at each checkpoint and wait for Julia.

### 9.1 What this stage adds and why

The repo already tracks readings, decisions and report notes. It has nowhere to keep experiments: the code that was run, its inputs, its outputs, and what they mean. Without that, results end up as loose CSVs, and the report's numbers can't be traced back to code.

This stage adds:

- An `experiments/` folder. Each experiment is a self-contained folder with a README record (the same front matter + markdown pattern as decisions), its code, its inputs and its results.
- The first three experiments: the preliminary study used in the interim report.
- Checks in `scripts/check.mjs`.
- An Experiments page in the app, plus links from Decisions, Report notes and the Dashboard.

The section keeps being useful after the interim report. Detector training runs, the backend comparison (MET-06) and the Phase 5 evaluations (EVAL-01 to EVAL-04) all become experiments here.

### 9.2 Decisions already made

| Topic | Decision |
|---|---|
| Name | Experiments (nav label, folder name and page title) |
| IDs | `EXP-01`, `EXP-02`, … Two digits, never reused, assigned in creation order |
| Folder | `experiments/EXP-NN-<slug>/`, with the slug in kebab-case from the title, at most 5 words |
| What the app does | Indexes, displays and edits each experiment's README record, previews its results, and links to its code on GitHub. It never runs code and never edits code or results |
| Where code runs | On Julia's laptop or Google Colab. Results are committed to the experiment's `results/` folder |
| Provenance | Every experiment says where it came from. Work reused from outside the FYP must say so, and must record whether the supervisor has approved the reuse |
| Report framing | EXP-01 to EXP-03 together are "the preliminary study" in the interim report (section `work-to-date`, with the setup described in `methodology`) |
| Dependencies | None new. CSV parsing uses a small hand-written parser (§9.6) |

### 9.3 Repo layout

See §2. The README's repo map has an `experiments/` row.

### 9.4 The experiment template (`experiments/_template.md`)

```markdown
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
```

Field rules:

- `kind` describes the experiment's role:
  - `preliminary`: done before the tool exists, to motivate it;
  - `main`: the evaluation that answers the project's questions;
  - `supporting`: training runs, calibration, timing and the like.
- `status: done` requires `run_on`, `headline` and at least one entry in `results`.
- `headline` and every number in Results must be traceable to a file in `results/`.

### 9.5 Stage 10a: repo, seed experiments and checks

**Step 1. Scaffold.** Create:

- `experiments/README.md`, with a short explanation, the rules from §9.7 and an index table (ID, title, kind, status, headline);
- `experiments/_template.md` from §9.4.

**Step 2. Get the source material.** The preliminary study reuses two experiments Julia designed and ran for her XAI module group project. That repo is public: https://github.com/MistorRonan/ISE-XAI-Group-10.

- Clone it to a temporary folder outside this repo. Record the full commit SHA of HEAD; it goes in each `origin`.
- Note for the provenance sections: that repo's git history is a single commit by another team member, so it does not show who wrote what. The README lists the team as Julia Hooper, Bláithín Kavanagh, Rory Linnane and April Gilhool. Julia states that she designed, coded and ran the experiments. Record exactly that, and claim nothing more.
  > **Checked 2026-11-04 (Claude Code):** the clone at `9a6664468b9e472cd4f3dfe29f8657fdd9b5b1c4` has 121 commits by several members, not one. The EXP-01 files were all added by Julia (9 October 2026). The EXP-02 notebook was first added by `blaithinn` (8 October 2026) and moved into its folder with small edits by Julia (9 October 2026); its results were committed by Julia. The provenance sections record what the history shows.
- Do not copy:
  - the group's write-ups (`EXP*.md`), paper, journal or plans. They were written for the group paper and partly by others;
  - anything about SHAP or LIME. Those analyses answer the XAI module's question, not this project's.
- The README files are written fresh for the FYP (Step 4).

**Step 3. Copy files into EXP-01 and EXP-02.** Folder names in the source contain spaces; quote them.

| From the XAI repo | To |
|---|---|
| `experiments/identity term swap/02_identity_swap.ipynb` | `experiments/EXP-01-identity-mentions/code/` (unmodified) |
| `experiments/identity term swap/results/` `exp2_sentences.csv`, `exp2_results.csv`, `exp2_debias_comparison.csv`, `fig_exp2_score_heatmap.png` | `experiments/EXP-01-identity-mentions/results/` |
| `experiments/report vs promote/01_report_vs_promote.ipynb` | `experiments/EXP-02-report-and-counter/code/` (unmodified) |
| `experiments/report vs promote/data/exp1_sentences.csv` | `experiments/EXP-02-report-and-counter/data/` |
| `experiments/report vs promote/results/` `exp1_results.csv`, `exp1_summary.csv`, `fig_exp1_scores.png` | `experiments/EXP-02-report-and-counter/results/` |

Notes on these files:

- Notebooks stay as they were run, including their SHAP and LIME cells, so they stay a faithful record. Each README says which cells produce the scores used here: the scoring cells, not the attribution cells. Use cell numbers or headings as they appear in the notebook.
- `requirements.txt`. The notebooks install `detoxify shap lime` without version pins. Search both notebooks' saved outputs for printed library versions. If you find them, pin exactly those. If not, write the unpinned names under the comment `# Versions were not recorded when these notebooks were run (Colab, October 2026).` Do not guess them. Ask Julia whether she has the Colab session details; don't invent dates or versions.
- Size rules. Files in `data/` and `results/` up to 5 MB are fine. Anything over 5 MB needs Julia's OK. Never commit anything over 50 MB. Put a pointer to the original source in the README instead.

**Step 4. Write EXP-01, EXP-02 and EXP-03.**

*EXP-01: How an off-the-shelf filter treats harmless identity mentions*

| Field | Value |
|---|---|
| kind | preliminary |
| status | done |
| code_by | julia |
| origin | "Julia's own runs for the XAI module group project, repo MistorRonan/ISE-XAI-Group-10 at commit `<SHA>`" |
| reuse_approved | pending |
| decisions | [DET-01, MET-05, VAL-01, DET-03] |
| sections | [work-to-date, methodology] |
| readings | [dixon2018measuring, borkan2019nuanced, dodge2021documenting, udagawa2025bias] (keep only those that exist in `readings/`) |
| run_on | The date from the notebook's metadata or the source repo's commit date. If neither is available, ask Julia |

Question: does Detoxify score harmless sentences higher just because they name a group? Method: 10 templates × (15 identity terms + 4 neutral controls) = 190 sentences, scored by Detoxify `original` and `unbiased`. Take the details from the notebook.

*EXP-02: How an off-the-shelf filter treats reporting and arguing against abuse*

| Field | Value |
|---|---|
| kind | preliminary |
| status | done |
| code_by | julia |
| origin | The same repo and commit as EXP-01 |
| reuse_approved | pending |
| decisions | [DET-01, DET-06, DET-03] |
| sections | [work-to-date, methodology] |
| readings | [gligoric2024nlp, rottger2021hatecheck] (if present) |

Question: does Detoxify flag sentences that report or argue against abuse as often as sentences that promote it? Method: 16 topics × 3 versions (promote, report, counter) = 48 sentences, scored by both Detoxify models.

*EXP-03: False-positive rates at filter cut-offs (re-analysis)*

This experiment holds the new FYP analysis that combines EXP-01 and EXP-02 into the figure used in the interim report.

| Field | Value |
|---|---|
| kind | preliminary |
| status | done |
| code_by | claude (drafted with Claude; Julia to review) |
| origin | "" (new FYP work), so reuse_approved is omitted |
| depends_on | [EXP-01, EXP-02] |
| decisions | [MET-05, MET-04] |
| sections | [work-to-date] |
| readings | [mendu2025safer] (if present) |

Question: at the cut-offs real pipelines use, what share of harmless and counter-speech sentences would Detoxify remove, and how certain are those rates?

Code: put the script from Appendix A in `code/fp_rates.py`. You may tidy it (argparse, a docstring, clearer names), but the output CSVs must not change. The inputs are read from `../EXP-01-identity-mentions/results/exp2_results.csv` and `../EXP-02-report-and-counter/results/exp1_results.csv`. The outputs are `results/fp_rates.csv` and `results/fp_by_term.csv`. Its only dependency is pandas (plus numpy).

Verify: run it and compare with Appendix B. Every number must match. If anything differs, stop and report it. Don't adjust the script to force a match.

*Writing all three READMEs*

- Fill every body section from the template, in plain UK English, at the level of the plan doc's section 4.
- Every number comes from a results file, and you name the file.
- Each Limits section covers:
  - the sentences are short templates, not real web text;
  - the report and counter sets have only 16 sentences each, so their intervals are wide;
  - one filter family was tested;
  - the EXP-02 topics are not all about the nine Equal Status grounds.
- Each "Where this came from" section in EXP-01 and EXP-02 ends with: `Supervisor approval of reuse: pending (asked <date>).` Leave the date as `<date>` for Julia to fill in.

**Step 5. Checks (`scripts/check.mjs`).** Add these to the script, and to §4:

- Parse `experiments/*/README.md` front matter and validate it against §9.4. Fail on unknown fields or bad enum values. Fail if `id` doesn't match the folder name's `EXP-NN` prefix, or if an ID is used twice.
- Every `decisions`, `readings`, `sections` and `depends_on` value exists. Missing readings are a warning (Julia may not have summarised them yet); everything else is an error.
- Every `results[].file` exists inside that experiment's folder.
- `status: done` requires `run_on`, a non-empty `headline` and at least one `results` entry.
- A non-empty `origin` requires `reuse_approved`. `pending` is a warning ("EXP-01: reuse not yet approved by supervisor"); `no` is an error ("remove or replace this experiment").
- No file under `experiments/` is over 50 MB (error) or over 5 MB (warning). No PDFs.
- `app/public/status.json` gains `experiments: { total, byStatus, byKind, reusePending }`.
- The README status block gains `· experiments: N done` after the decisions count.

Add a deliberately broken fixture test, as in stage 2: an experiment with a bad decision ID must fail.

**Step 6. Log and commit.**

- `ai-use.md`: add a row for each README, the template, `fp_rates.py` and the check changes.
- Commits:
  - `experiments: scaffold folder and template`
  - `experiments: add EXP-01 and EXP-02 from XAI project (claude draft, unverified)`
  - `experiments: add EXP-03 false-positive re-analysis (claude draft, unverified)`
  - `checks: validate experiments`

**Checkpoint 10a.** Stop and report:

- the source commit SHA;
- the Appendix B comparison;
- what you couldn't find (run dates, versions);
- anything you left out.

This part is worth having before the interim report (06/11/2026). The app parts can wait.

### 9.6 Stage 10b: the Experiments page

Follow the visual design in §5 and the layout in §6.2. Reuse existing components (`SplitPage`, `Pills`, `MarkdownView`, `RichEditor`, `Banner`) rather than writing new ones.

**Data layer**

- In `repo.ts`, add `/^experiments\/[^/]+\/README\.md$/` and `/^experiments\/_template\.md$/` to `WANTED`. Parse them into `experiments: Doc<ExperimentMeta>[]`, plus the template, the same way decisions are parsed.
- Don't load CSVs, images or code at startup. When an experiment is opened, fetch the files listed in its `results` on demand through the existing blob fetch and IndexedDB cache.
- Images need base64 → data URL, with the MIME type taken from the extension (`.png`, `.jpg`, `.svg`). Check whether `fetchBlob` already decodes to text. If it does, add a sibling that returns the raw base64.
- Add `ExperimentMeta` to `types.ts`, mirroring §9.4.
- Write a small CSV parser in `app/src/data/csv.ts`, with no dependency. It must handle quoted fields with commas, escaped quotes (`""`), newlines inside quotes, CRLF and a trailing newline. Unit-test it: the EXP-02 sentences contain commas inside quotes.

**Routes and nav**

- Routes: `/experiments`, `/experiments/new`, `/experiments/:id`, `/experiments/:id/edit`.
- Add a nav item Experiments, with a count, after Decisions. Give it a simple flask or beaker icon in `Icons.tsx`, in the same style as the others.

**List pane**

- Grouped under Preliminary, Main and Supporting, each with a count.
- Each row shows the ID, the title, a status pill (planned / running / done) and the headline in one truncated line. Reused experiments (non-empty `origin`) get a small Reused tag, and a Reuse pending tag while approval is pending.

**Reader pane (view)**

- Header: ID, title, kind, status; `run_on`, `code_by`; `depends_on` as links to those experiments.
- Headline: a callout box with the headline.
- Links: chips for decisions (link to the decision), report sections (link to the notes page for that section) and readings (link to the reading).
- Body: the README body, rendered with `MarkdownView`.
- Results:
  - One card per `results` entry, with its caption.
  - CSVs show as a table of the first 50 rows, with "Showing 50 of N rows" and an Open on GitHub link.
  - Images are shown inline at full column width, with alt text taken from the caption.
- Code:
  - Lists every file under the experiment's `code/` folder, taken from the repo tree that is already loaded.
  - Each file links to `https://github.com/<owner>/<repo>/blob/<branch>/<path>`, using `config.ts`.
  - Also links to `requirements.txt`.
- Where this came from: if `origin` is set, a highlighted box at the top of the body with the origin and the `reuse_approved` pill.

**Edit**

- The front matter is edited through form fields:
  - `kind`, `status`, `question`, `run_on`, `code_by`, `origin`, `reuse_approved`, `headline`;
  - multi-selects for `decisions`, `sections`, `readings` and `depends_on`;
  - `results` as file path + caption rows.
- The body uses the same rich text editor as decisions.
- Saving works as in §6.1: one commit, conflict banner, local draft.
- Changing `status` to `done` with an empty `run_on` fills in today's date and shows a note asking Julia to correct it if the run was on a different day.
- Code, data and results are never editable in the app.

**New experiment**

- Asks for the title and kind.
- Assigns the next free ID and creates `experiments/EXP-NN-<slug>/README.md` from the template, with `status: planned`.
- Git can't hold empty folders, so only the README is created. The page explains that code and results are added from the laptop or Colab (link to the Guide).

**Tests**

- A smoke test like `decisions.smoke.test.tsx`: list, open, edit, save, using fixture data.
- The CSV parser tests.

**Checkpoint 10b.** Stop and report.

### 9.7 Stage 10c: links, dashboard and guide

**Decisions.** Each decision gets an Evidence panel under its Readings panel. It lists every experiment whose `decisions` includes that ID, with its status and headline, and links to it.

**Report notes.** The side panel gets an Experiments list for that section, under the readings. Each item has:

- Open;
- Copy headline: copies `EXP-01: <headline>` for pasting into notes.

**Dashboard**

- An Experiments card: done / running / planned, by kind.
- To do gains:
  - "EXP-NN: reuse not yet approved by supervisor";
  - "EXP-NN is done but not linked to a report section";
  - "EXP-NN is running with no results yet".

**Guide.** Write `docs/experiments.md` and show it on the Guide page. It covers:

- What counts as an experiment, and the three kinds.
- Adding one: New experiment in the app, or copy the template.
- Writing the README before running: fill in Question and Method first, with `status: planned`.
- Running it on a laptop or Colab: set a seed; record versions with `pip freeze > requirements.txt` (on Colab, `pip freeze` after installs); write outputs only to `results/`.
- Committing code, data and results, then setting the status to `done` and filling in the headline from the results.
- Rerunning: overwrite `results/`, update `run_on`, and commit as `experiments: rerun EXP-NN`. The old results stay in git history.
- Reused work: fill in `origin` and `reuse_approved`, and never copy other people's writing.
- Citing in the report: the report describes the experiment and cites any published sources. The EXP ID is for Julia's notes, not for the paper's reference list.

**Checkpoint 10c.** Stop and report.

### 9.8 How Claude Code works with experiments from now on

When Julia says "set up EXP-NN for `<question>`":

- create the folder and README with `status: planned`;
- draft Question, Method, Limits and How to rerun;
- suggest decisions and sections using only IDs that exist;
- commit as `experiments: plan EXP-NN (claude draft)`.

When Julia says "write up EXP-NN" after a run:

- read the files in `results/`;
- fill in Results, What it means and the headline, using only numbers from those files, each with its file named;
- set `status: done`;
- add a row to `ai-use.md`;
- run the check;
- commit as `experiments: write up EXP-NN (claude draft, unverified)`.

Never:

- edit a results file by hand;
- round differently from the file without saying so;
- describe a result that isn't in a committed file.

### 9.9 Stage table

See §8 (rows 10a, 10b, 10c).

**Stage 10 is done when:**

- the three experiments are in the repo, and EXP-03 reproduces Appendix B exactly;
- the check validates experiments and fails on the broken fixture;
- the Experiments page lists, shows, edits and saves experiments, with CSV and image previews;
- decisions and report notes link to their experiments, the dashboard shows the card and to-dos, and the Guide page explains the workflow.

### Appendix A: `fp_rates.py` (as run on 3 November 2026)

Usage: `python fp_rates.py <exp2_results.csv> <exp1_results.csv> <out fp_rates.csv> <out fp_by_term.csv>`

```python
import sys, pandas as pd, numpy as np
from math import sqrt
def wilson(k,n,z=1.96):
    if n==0: return (np.nan,np.nan)
    p=k/n; d=1+z*z/n; c=p+z*z/(2*n); m=z*sqrt(p*(1-p)/n+z*z/(4*n*n))
    return ((c-m)/d,(c+m)/d)
e2=pd.read_csv(sys.argv[1]); e1=pd.read_csv(sys.argv[2])
th=[0.1,0.4,0.5]
rows=[]
for model in ["original","unbiased"]:
    col=f"p_{model}"
    for name,sub in [("Identity mention (Exp 2)",e2[~e2.is_control]),("Neutral control (Exp 2)",e2[e2.is_control]),
                     ("Promotes abuse (Exp 1)",e1[e1.condition=="promote"]),("Reports abuse (Exp 1)",e1[e1.condition=="report"]),("Argues against abuse (Exp 1)",e1[e1.condition=="counter"])]:
        for t in th:
            k=int((sub[col]>=t).sum()); n=len(sub); lo,hi=wilson(k,n)
            rows.append(dict(model=model,set=name,threshold=t,flagged=k,n=n,rate=k/n,lo=lo,hi=hi,mean_p=sub[col].mean()))
r=pd.DataFrame(rows); r.to_csv(sys.argv[3],index=False)
pd.set_option("display.width",200)
print(r.assign(rate=lambda d:(d.rate*100).round(1),lo=lambda d:(d.lo*100).round(1),hi=lambda d:(d.hi*100).round(1),mean_p=lambda d:d.mean_p.round(3)).to_string(index=False))
print(e1.condition.value_counts().to_dict())
# per-term at 0.4 and 0.5
ids=e2[~e2.is_control]
pt=ids.groupby("term").agg(orig_mean=("p_original","mean"),orig_ge04=("p_original",lambda s:(s>=0.4).sum()),orig_ge05=("p_original",lambda s:(s>=0.5).sum()),unb_mean=("p_unbiased","mean"),unb_ge04=("p_unbiased",lambda s:(s>=0.4).sum()),unb_ge05=("p_unbiased",lambda s:(s>=0.5).sum()),n=("text","count")).sort_values("orig_mean",ascending=False)
print(pt.round(3).to_string()); pt.to_csv(sys.argv[4])
print("max control p:",e2[e2.is_control][["p_original","p_unbiased"]].max().to_dict())
```

The set labels say "Exp 1" and "Exp 2" because those were the XAI project's numbers. When tidying, rename them to "EXP-02" and "EXP-01". The label change is the only permitted difference in the output CSVs; every count, rate and interval must be identical.

### Appendix B: expected results (cut-off 0.4)

From `fp_rates.csv`, rows with threshold 0.4:

| Model | Set | Flagged | n |
|---|---|---|---|
| original | Identity mention | 18 | 150 |
| original | Neutral control | 0 | 40 |
| original | Promotes abuse | 15 | 16 |
| original | Reports abuse | 7 | 16 |
| original | Argues against abuse | 11 | 16 |
| unbiased | Identity mention | 10 | 150 |
| unbiased | Neutral control | 0 | 40 |
| unbiased | Promotes abuse | 16 | 16 |
| unbiased | Reports abuse | 15 | 16 |
| unbiased | Argues against abuse | 13 | 16 |

From `fp_by_term.csv`, flagged at 0.4 out of 10 sentences each (`orig_ge04`, `unb_ge04`):

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

These are the numbers the interim report and the plan doc's section 4 rely on:

- 12% of identity mentions flagged = 18 / 150.
- Neutral words never flagged = 0 / 40.
- 44% vs 94% of reporting sentences = 7 / 16 (original) vs 15 / 16 (unbiased).
