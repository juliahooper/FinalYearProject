# Generative AI use

The ISE FYP specification (2026–2027) allows generative AI only with the supervisor's express written permission by email. A copy of the email exchange (the request and the supervisor's response) must be included in the report, along with a declaration that describes in detail which AI was used, how, and for what purpose. This file is the evidence for that declaration.

## 1. Permission

> **To do:** paste Colin Venters' email permission here (or link to a saved copy), including your request and his reply, with dates.

## 2. Tools used

| Tool | Model | Used for |
|---|---|---|
| Claude Code (VS Code extension), by Anthropic | Claude Opus 5.5 (`claude-opus-5-5`) | Setting up this repo (templates, README, paper scaffold, docs), drafting reading summaries for Julia to check against the PDFs, writing the check script and the web app. |

Rules Claude Code follows here (from `PLAN.md`): it never invents citations, authors, titles, venues, DOIs, page numbers or quotes; every reading summary it drafts is marked `summarised_by: claude` and `verified: false` until Julia checks it against the PDF; and every file it drafts or substantially edits gets a row below.

## 3. Log

What the AI did: **drafted** (wrote new content), **edited** (substantially changed existing content), **checked** (reviewed or tested without writing content), **copied** (moved existing text or files without writing new content).

| Date | File | What the AI did | Verified by Julia (date) |
|---|---|---|---|
| 2026-10-31 | `PLAN.md` | Copied verbatim from Julia's plan | |
| 2026-10-31 | `README.md` | Drafted; aim, objectives and milestones copied from the signed proposal form | |
| 2026-10-31 | `.gitignore`, `.gitattributes` | Drafted | |
| 2026-10-31 | `course-materials/README.md` | Drafted, from reading the spec, proposal form and lecture slides; PDFs copied in from Downloads | |
| 2026-10-31 | `tags.yml` | Drafted, from PLAN.md §3.3 | |
| 2026-10-31 | `readings/_template.md`, `readings/pdfs/README.md` | Drafted, from PLAN.md §3.2 | |
| 2026-10-31 | `decisions/_template.md` and 29 seeded `decisions/*.md` files | Drafted, from PLAN.md §3.4; ETH-01 timing updated from the FYP spec | |
| 2026-10-31 | `paper/main.tex` | Drafted, based on the ISE-XAI-Group-10 template; biblatex Cite It Right set-up written and tested | |
| 2026-10-31 | `paper/sections/*.tex` | Drafted comment blocks from the FYP spec marking guide and rubric; no report text | |
| 2026-10-31 | `paper/notes/*.md` | Drafted (headings only) | |
| 2026-10-31 | `paper/README.md`, `paper/REFERENCING.md`, `paper/drafts/README.md` | Drafted | |
| 2026-10-31 | `.github/workflows/build-paper.yml` | Edited, from the ISE-XAI-Group-10 workflow | |
| 2026-10-31 | `journal/templates/meeting.md`, `journal/templates/weekly.md` | Edited, from the ISE-XAI-Group-10 templates | |
| 2026-10-31 | `drafts/README.md` | Drafted | |
| 2026-10-31 | `docs/reading-workflow.md`, `docs/using-the-app.md` | Drafted | |
| 2026-10-31 | `ai-use.md` | Drafted | |
| 2026-10-31 | `readings/_template.md`, `PLAN.md`, `docs/reading-workflow.md`, `README.md` | Edited: note questions switched to the lecture's per-paper list; framing questions added to the README (Julia's request) | |
| 2026-10-31 | `scripts/check.mjs`, `package.json`, `app/public/status.json` | Drafted; tested on the clean repo and on a deliberately broken copy | |
| 2026-10-31 | `.github/workflows/check.yml` | Drafted | |
| 2026-11-01 | `readings/caliskan2017semantics.md` | Drafted reading summary from the arXiv preprint PDF (pilot 1); added the citekey to DET-01 and MET-01 | 2026-11-01 |
| 2026-11-01 | `readings/caliskan2017semantics.md`, `PLAN.md` | Edited: rewrote the note in Julia's requested style (analogies, examples, Mermaid diagrams, the paper's formulas); added the style rule to PLAN.md §7 | 2026-11-01 |
| 2026-11-01 | `readings/kumar2025detecting.md` | Drafted reading summary from the published IEEE PDF (pilot 2); added the citekey to VAL-01 | |
| 2026-11-01 | `readings/rajawat2024investigating.md` | Drafted reading summary from the published IEEE PDF (pilot 3); no decisions linked | 2026-11-01 |
| 2026-11-01 | `readings/follow-up.yml` | Drafted, from the reference lists of the three pilot readings and the proposal form, as printed there | |
| 2026-11-01 | `scripts/check.mjs`, `PLAN.md`, `docs/reading-workflow.md` | Edited: follow-up list validation and Zotero matching; the app's "To read next" view in the plan; the workflow step | |
| 2026-11-01 | `paper/shared/*`, `paper/interim/*`, `paper/final/*` | Edited: split the report into interim and final documents with a shared preamble and metadata; drafted section comment blocks from the FYP spec (no report text) | |
| 2026-11-01 | `paper/README.md`, `paper/drafts/README.md`, `paper/REFERENCING.md`, `paper/notes/work-to-date.md`, `paper/notes/project-plan.md` | Edited/drafted for the two-report structure | |
| 2026-11-01 | `.github/workflows/build-paper.yml`, `scripts/wordcount.sh` | Edited/drafted: build only the changed report, two artifacts, word count | |
| 2026-11-01 | `PLAN.md`, `scripts/check.mjs`, `docs/reading-workflow.md`, `README.md`, `.gitignore` | Edited: section IDs (work-to-date, project-plan, reports column), report notes switch, countdown wording | |
| 2026-11-01 | `tags.yml`, `decisions/EVAL-01..06`, `decisions/_template.md`, `scripts/check.mjs` | Drafted: impact evaluation tag, decision group and seeded open questions (Julia's request) | |
| 2026-11-01 | `readings/follow-up.yml` | Edited: impact evaluation references copied from Julia's earlier source reviews (ISE-XAI-Group-10), plus two "find" entries | |
| 2026-11-01 | `paper/final/sections/evaluation.tex`, `paper/final/sections/deliverable.tex`, `paper/final/main.tex`, `paper/interim/sections/methodology.tex`, `paper/interim/sections/project-plan.tex`, `paper/notes/evaluation.md` | Drafted/edited comment blocks for the new evaluation section (no report text) | |
| 2026-11-01 | `PLAN.md`, `docs/reading-workflow.md`, `paper/README.md` | Edited for the evaluation group, tag and section | |
| 2026-11-01 | `app/` (Vite + React + TypeScript scaffold, `src/`, `vite.config.ts`, `vercel.json`, `index.html`) | Drafted: sign-in, data layer (GitHub API, IndexedDB cache, front matter, save with conflict detection, drafts), app shell and placeholder pages; built and tested the data layer against the repo's files | |
| 2026-11-01 | `docs/using-the-app.md` | Drafted: sign-in, running locally, Vercel deployment | |
| 2026-11-01 | `app/src/editor/*`, `app/src/render/*`, `app/src/data/{edit,bib,readingText,useSave}.ts`, `app/src/components/*`, `app/src/pages/Readings.tsx`, `app/src/pages/readings/*` | Drafted stage 5 (readings: search, filters, reader, rich text editing, To read next, New reading) with unit, round-trip and smoke tests | |
| 2026-11-01 | `docs/using-the-app.md`, `PLAN.md` | Edited: how to use the Readings screens; packages list | |
| 2026-11-01 | `app/src/editor/useDocEditor.ts`, `app/src/components/DocEditorFrame.tsx`, `app/src/data/decisions.ts`, `app/src/pages/Decisions.tsx`, `app/src/pages/decisions/*`, `app/src/pages/readings/ReadingEditor.tsx` | Drafted stage 6 (Decisions: grouped list, progress, accordion, status, editing, readings panel with link/unlink, new decision) and refactored the shared editor logic, with tests | |
| 2026-11-01 | `docs/using-the-app.md` | Edited: how to use the Decisions screens | |
| 2026-11-01 | `app/src/pages/Notes.tsx`, `app/src/pages/notes/*`, `app/src/data/sectionNeeds.ts`, `app/src/data/repo.ts`, `app/src/editor/*` | Drafted stage 7 (Report notes: interim/final switch, notes editor, What this section needs, readings panel with Cite/Copy cite/Open), plus editor fixes for level-1 headings and LaTeX citations, with tests | |
| 2026-11-01 | `docs/using-the-app.md` | Edited: how to use the Report notes screen | |
| 2026-11-01 | `app/src/pages/readings/ReadingView.tsx`, `docs/using-the-app.md`, `PLAN.md` | Edited: removed the unverified banner (Julia's request); verifying moved to the status menu | |
| 2026-11-01 | `app/src/data/repo.ts`, `ai-use.md` | Edited: fixed the app not loading ai-use.md, so verifying in the app now dates it; filled in the dates for the two readings Julia verified in the app before the fix (from her commits) | |
| 2026-11-01 | `readings/mendu2025safer.md` | Drafted reading summary from the arXiv PDF (2505.02009v3); added the citekey to DET-01, DET-02, DET-04, DET-06, ARCH-04, MET-05, VAL-02, EVAL-01, EVAL-06 | |
| 2026-11-01 | `readings/follow-up.yml` | Edited: marked Mendu saved; added Longpre, Gehman, Luccioni, Parmar and Jansen from its reference list | |
| 2026-11-02 | `paper/shared/preamble.tex`, `paper/REFERENCING.md` | Edited: year-only dates, dropped arXiv comment notes and the pre-published label (found while test-building with real Zotero entries) | |
| 2026-11-02 | `readings/dixon2018measuring.md` | Drafted reading summary from the Google-hosted author PDF (renamed from 4578.pdf); added the citekey to DET-01, DET-03, MET-04, MET-05, EVAL-02, EVAL-03, EVAL-05, EVAL-06, CI-02 | |
| 2026-11-02 | `readings/follow-up.yml` | Edited: marked Dixon saved; added Blodgett, Beutel and Wulczyn from its reference list; added it to Hardt and Bolukbasi's sources | |
| 2026-11-02 | `readings/de-arteaga2019bias.md` | Drafted reading summary from the arXiv preprint PDF (1901.09451v1, renamed to the citekey); added the citekey to DET-01, MET-01, MET-05, VAL-01, EVAL-02, EVAL-04, UI-02 | |
| 2026-11-02 | `readings/follow-up.yml` | Edited: marked Bias in Bios saved; added Zhao (2018), Rudinger, Garg and Dwork & Ilvento from its reference list; added it to five existing entries' sources | |
| 2026-11-02 | `readings/*.md`, `readings/_template.md`, `scripts/check.mjs`, `PLAN.md` | Edited (by a second Claude Code session; reviewed and committed by this one): reading statuses changed to to-read / in-progress / done, with done meaning verified | |
| 2026-11-02 | `app/src/highlight/*`, `app/src/pages/readings/{HighlightableReading,AddNoteDialog}.tsx`, `app/src/components/{Dialog,NotesAccordion,Pills}.tsx`, `app/src/data/{edit,repo,types}.ts`, pages and tests, `docs/using-the-app.md` | Drafted (by a second Claude Code session; reviewed, fixed and committed by this one): highlighting passages of readings as notes for decision groups and report sections; status hearts | |
| 2026-11-02 | `readings/de-arteaga2019bias.md` | Edited: escaped two stray asterisks (FAT\*) that broke the bold formatting | |
| 2026-11-02 | `app/src/data/{deleteReading,dashboard}.ts`, `app/src/data/{github,cache,RepoContext}.ts*`, `app/src/pages/readings/ReadingEditor.tsx`, `app/src/pages/{Dashboard,Guide}.tsx`, `app/src/components/Bars.tsx`, `app/src/styles.css`, tests | Drafted: deleting a reading (with unlinking) and Stage 8 (Dashboard and Guide); dashboard colours checked with a palette validator; made two smoke tests wait for editors to load | |
| 2026-11-02 | `docs/using-the-app.md` | Edited: @-mentions, deleting a reading, Dashboard and Guide | |
| 2026-11-02 | `app/src/styles.css`, `app/src/components/SignIn.tsx`, `app/src/pages/{Decisions,decisions/NewDecision,readings/NewReading,readings/ToReadNext}.tsx`, `PLAN.md` | Edited (by another Claude Code session; reviewed and committed by this one): final UI pass with pastel accents, page titles, segmented tabs and soft shadows on raised elements | |
| 2026-11-03 | `readings/rottger2021hatecheck.md` | Drafted reading summary from the ACL Anthology PDF (2021.acl-long.4); added the citekey to DET-01, MET-01, VAL-01, MET-05, DET-06, EVAL-05 | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: added 2 from rottger2021hatecheck's reference list | |
| 2026-11-03 | `readings/sap2020social.md` | Drafted reading summary from the ACL Anthology PDF (2020.acl-main.486); added the citekey to DET-01, DET-03, DET-06, MET-01, VAL-01, UI-02 | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: added 2 from sap2020social's reference list; added sap2020social to the sources of 1 existing entries | |
| 2026-11-03 | `readings/borkan2019nuanced.md` | Drafted reading summary from the ACM PDF (3308560.3317593); added the citekey to MET-05, VAL-01, MET-04, DET-03, EVAL-03 | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: added 3 from borkan2019nuanced's reference list; added borkan2019nuanced to the sources of 3 existing entries | |
| 2026-11-03 | `readings/nangia2020crowspairs.md` | Drafted reading summary from the ACL Anthology PDF (2020.emnlp-main.154); added the citekey to MET-01, VAL-01, EVAL-02, DET-06 | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: added 1 from nangia2020crowspairs's reference list | |
| 2026-11-03 | `readings/vidgen2021introducing.md` | Drafted reading summary from the ACL Anthology PDF (2021.naacl-main.182); added the citekey to DET-03, DET-06, ARCH-04, MET-05, ETH-02 | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: added 3 from vidgen2021introducing's reference list | |
| 2026-11-03 | `readings/blodgett2020language.md` | Drafted reading summary from the ACL Anthology PDF (2020.acl-main.485); added the citekey to DET-01, MET-01, EVAL-06, VAL-03 | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: added 2 from blodgett2020language's reference list | |
| 2026-11-03 | `readings/blodgett2021stereotyping.md` | Drafted reading summary from the ACL Anthology PDF (2021.acl-long.81); added the citekey to VAL-01, MET-01, EVAL-02, DET-06, EVAL-06 | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: added 1 from blodgett2021stereotyping's reference list; added blodgett2021stereotyping to the sources of 1 existing entries | |
| 2026-11-03 | `readings/antoniak2021bad.md` | Drafted reading summary from the ACL Anthology PDF (2021.acl-long.148); added the citekey to MET-01, MET-03, ARCH-07, ETH-02, EVAL-05 | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: added 3 from antoniak2021bad's reference list | |
| 2026-11-03 | `readings/guo2017calibration.md` | Drafted reading summary from the PMLR PDF (guo17a); added the citekey to MET-02, MET-05, MET-04, DET-04, DET-05, DET-03 | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: added 3 from guo2017calibration's reference list | |
