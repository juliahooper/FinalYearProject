# Screening training data for representational bias before LLM training: CI-integrated, self-hostable tool

<!-- status:start -->
> Readings: 34 / 30 · verified: 1 · decisions: 18 decided / 17 open · interim report in 2 days
<!-- status:end -->

## Introduction

This project designs, implements and evaluates an open-source, self-hostable tool that scans training data (scraped web content and structured datasets) for representational bias and harmful stereotyping before it enters an LLM training pipeline. The tool runs as a CI/CD step, scores each new source, and accepts or rejects it against developer-configured thresholds. Medical text is the principal case study. The same scanner could help dataset and website publishers self-assess their content before release.

## The gap

- Curation toolkits (NVIDIA NeMo Curator, Dolma, datatrove) do deduplication and toxicity filtering for large one-off pretraining runs. They aren't lightweight per-source gates for small teams.
- Toxicity filters miss subtler representational bias, such as stereotyped or dismissive descriptions of groups.
- Governance platforms (Credo AI, Holistic AI) are enterprise products, not open, self-hostable detectors.
- Bias research mostly examines model outputs (e.g. GenderBench). This project works on the training data upstream.

## Framing questions

From the research methods lecture (29/10/2026). After skim-reading the literature, answer these in a few sentences and use them to revise the introduction.

1. **What is the problem?** (Scope and challenge)
2. **Who said it's a problem?** (Contextual evidence)
3. **What do we know about the problem?** (Literature review)
4. **How are you going to investigate the problem?** (Method)
5. **How is the state of knowledge changed?** (= Why bother?)

In the report, question 1 sets the scope in the introduction, question 2 is the background section, and question 3 is related work and the gap.

## Aim and objectives

**Aim:** To design, implement and evaluate an open-source, self-hostable tool that screens training data for representational bias and stereotyping, as a CI/CD step before the data is admitted to an LLM training pipeline.

1. To review existing curation tools, governance platforms and bias benchmarks in order to define a measurable notion of representational bias and to establish the gap the tool addresses.
2. To develop a detector for subtle representational bias by fine-tuning a small open-weight model that runs locally, with an optional commercial API backend and an ensemble mode that flags disagreements for human review.
3. To implement a CI/CD-integrated gate with developer-configurable score thresholds that accept or reject each source, and a report that non-technical staff can act on.
4. To validate the tool on medical text, using existing labelled benchmarks and a small labelled sample built around documented medical biases, and to benchmark the backends on accuracy, cost and privacy.
5. To evaluate report usability, through readability measures, a heuristic evaluation and a cognitive walkthrough, and to analyse and report the findings.

## Milestones

From the proposal form, with the interim date corrected to the current deadline.

| When | Milestone |
|---|---|
| By 06/11/2026 (interim report) | Scope and validation plan agreed with the supervisor, ethics position confirmed, literature review drafted and baseline results obtained on benchmark data. |
| November to December 2026 | Development of the scanning pipeline and thresholds, fine-tuning of the local model and a first working CI integration. |
| January to February 2027 | Addition of the commercial backend and ensemble mode, construction of the medical labelled sample and execution of the main benchmark. |
| March 2027 | Evaluation of report usability and analysis of results. |
| April 2027 (final submission 07/04/2027) | IEEE-format write-up, 2 to 3 minute video summary and final submission. |

## Repo map

| Folder or file | What it holds |
|---|---|
| [`PLAN.md`](PLAN.md) | The build plan for this repo and its web app |
| [`ai-use.md`](ai-use.md) | Log of generative AI use, for the report's AI declaration |
| [`tags.yml`](tags.yml) | The fixed tag list, with a colour per tag |
| `references.bib` | Bibliography exported automatically from Zotero (never edited by hand) |
| [`course-materials/`](course-materials/) | FYP spec, lecture slides and forms (private; never published) |
| [`readings/`](readings/) | One summary per reading, named by citekey (PDFs stay local) |
| [`decisions/`](decisions/) | One file per design or metric decision, from open to decided |
| [`drafts/`](drafts/) | Rough drafts in any format |
| [`journal/`](journal/) | Supervisor meeting notes and weekly entries |
| [`paper/`](paper/) | The interim and final reports in LaTeX (IEEE conference template, UL Harvard referencing) |
| [`docs/`](docs/) | How-to guides: the reading workflow and the app |
| [`scripts/`](scripts/) | Repo consistency checks: run `npm install` once, then `npm run check` |
| `app/` | The web app (stage 4 onwards) |
| [`.github/workflows/`](.github/workflows/) | Paper build and checks |

## Links

- App: https://app-five-phi-36.vercel.app (sign in with your GitHub token; see [docs/using-the-app.md](docs/using-the-app.md))
- Latest paper PDFs: built by the **Build paper** action (Actions tab → latest run → Artifacts → `interim-pdf` and `final-pdf`), with word counts on the run's Summary page. Dated snapshots go in [`paper/drafts/`](paper/drafts/).
