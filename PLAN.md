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
status: to-read               # to-read | skimmed | summarised | verified
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
group: metrics          # system | detector | metrics | ci-cd | reporting | validation | governance
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
| `deliverable` | Primary research / deliverable: the tool and its evaluation | final | 25 |
| `analysis` | Analysis | final | 10 |
| `conclusion` | Summary, conclusions, recommendations, future work | final | 10 |

Both reports also end with `declarations.tex` (academic integrity and generative AI). It has no section ID, because readings don't feed it and it has no notes file.

The marks come from the spec's marking guide, which isn't labelled as interim or final, and whose rubric is headed "Residency 4" (the module the final report is submitted under). Check with Colin which marking scheme applies to the interim report.

### 3.6 Paper (`paper/`)

- **Two reports**, as two separate LaTeX documents:
  - **Interim report** (`paper/interim/`, due 06/11/2026). IEEE conference format. It covers work done so far and the research. It follows the final report's structure without the results sections (deliverable, analysis, conclusion), and adds `work-to-date` and `project-plan`.
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

- Tag pills use their pastel from `tags.yml` with black text, in both light and dark mode, so tags look the same everywhere.
- Base size 14px for the interface and 15px/1.6 for reading text. Keep reading lines around 65–70 characters wide.
- Radius 8–10px. Use hairline borders, not shadows. Pink appears only on the primary button, selected markers, progress bars, question labels and links. Use `--acc` for pink fills and `--acc-text` whenever pink is used as text.
- Stars are ★ glyphs, filled in pastel yellow (`--star`) and unfilled in `--star-off`. Give filled stars a 1px `--line`-coloured outline (via `-webkit-text-stroke` or an SVG star) so pastel yellow still reads on white.
- Status is shown as a small pill: to-read (grey), skimmed (amber), summarised (lavender), verified (green, with a tick).
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

  Ask before adding anything else.
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
- An "Unverified: drafted by Claude" banner appears while `verified: false` and `summarised_by: claude`, with a **Mark as verified** button. That button sets `verified: true` and `status: verified`, then saves.

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

- The list pane groups decisions under their headings (System design, Detector, Metrics, CI/CD, Reporting, Validation, Governance), with counts such as "Metrics · 1 / 6 decided".
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
- **Sources:** a progress bar toward 30, showing verified / summarised / to-read.
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
   - Front matter: copy title, authors, year, venue and DOI from the bib entry, not from memory. Set `summarised_by: claude`, `verified: false`, `status: summarised`, `stars: 0` and `added: today`.
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

At the end of every stage:
1. Summarise what changed and how to try it.
2. List anything left undone or any assumptions you made.
3. Wait for Julia's go-ahead before starting the next stage.
