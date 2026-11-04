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
| 2026-11-03 | `readings/gebru2021datasheets.md` | Drafted reading summary from the CACM PDF (3458723); added the citekey to ETH-02, DET-03, VAL-01, UI-01, ARCH-03 | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: added 1 from gebru2021datasheets's reference list; added gebru2021datasheets to the sources of 2 existing entries | |
| 2026-11-03 | `readings/nadeem2021stereoset.md` | Drafted reading summary from the ACL Anthology PDF (2021.acl-long.416); added the citekey to EVAL-02, VAL-01, MET-01 | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: added 2 from nadeem2021stereoset's reference list | |
| 2026-11-03 | `readings/ribeiro2020accuracy.md` | Drafted reading summary from the ACL Anthology PDF (2020.acl-main.442); added the citekey to VAL-01, EVAL-05, MET-05 | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: added 2 from ribeiro2020accuracy's reference list | |
| 2026-11-03 | `readings/saito2015precisionrecall.md` | Drafted reading summary from the PLOS ONE PDF (saved as file.pdf); added the citekey to MET-05, MET-06, MET-04 | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: added 2 from saito2015precisionrecall's reference list | |
| 2026-11-03 | `readings/dror2018hitchhikers.md` | Drafted reading summary from the ACL Anthology PDF (P18-1128); added the citekey to MET-05, MET-06, EVAL-03, DET-03 | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: added 3 from dror2018hitchhikers's reference list | |
| 2026-11-03 | `readings/zafrir2019q8bert.md` | Drafted reading summary from the arXiv preprint PDF (1910.06188v2); added the citekey to ARCH-05, ARCH-06, CI-03, MET-06, DET-02 | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: added 2 from zafrir2019q8bert's reference list | |
| 2026-11-03 | `readings/esri2017who.md` | Drafted reading summary from the ESRI PDF (saved as BKMNEXT342 (1).pdf); added the citekey to MET-01, VAL-01, DET-01, EVAL-06 | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: added 3 from esri2017who's reference list | |
| 2026-11-03 | `readings/follow-up.yml` | Edited: marked Hardt (2016) and Dodge (2021) saved now they are in Zotero | |
| 2026-11-03 | `decisions/{MET-01,VAL-01,ARCH-05,MET-02,DET-03}-*.md` | Edited (Julia's request): corrected claims found while summarising readings (Traveller odds ratios and sample size; what Antoniak's coherence scores measure; ESRI as a discrimination not stereotype source; 8-bit accuracy loss needs quantisation-aware training; per-sigmoid temperature scaling; CAD counter speech limits) | |
| 2026-11-04 | `readings/gligoric2024nlp.md` | Drafted reading summary from the ACL Anthology PDF (2024.naacl-long.331); added the citekey to DET-01, DET-03, DET-04, DET-06, ARCH-04, VAL-01 | |
| 2026-11-04 | `readings/follow-up.yml` | Edited: added 3 from gligoric2024nlp's reference list | |
| 2026-11-04 | `readings/hartvigsen2022toxigen.md` | Drafted reading summary from the ACL Anthology PDF (2022.acl-long.234); added the citekey to DET-03, VAL-01, DET-06, MET-01, ETH-02 | |
| 2026-11-04 | `readings/follow-up.yml` | Edited: added 1 from hartvigsen2022toxigen's reference list | |
| 2026-11-04 | `readings/dodge2021documenting.md` | Drafted reading summary from the ACL Anthology PDF (2021.emnlp-main.98); added the citekey to DET-01, ARCH-04, MET-01, EVAL-06, ETH-02, UI-01 | |
| 2026-11-04 | `readings/follow-up.yml` | Edited: added 1 from dodge2021documenting's reference list | |
| 2026-11-04 | `readings/sap2019risk.md` | Drafted reading summary from the ACL Anthology PDF (P19-1163); added the citekey to DET-01, DET-03, DET-06, MET-05, EVAL-06 | |
| 2026-11-04 | `readings/follow-up.yml` | Edited: added sap2019risk to the sources of 2 existing entries | |
| 2026-11-04 | `readings/udagawa2025bias.md` | Drafted reading summary from the ACL Anthology PDF (2025.findings-emnlp.2); added the citekey to DET-01, MET-01, MET-03, EVAL-01, EVAL-06 | |
| 2026-11-04 | `readings/follow-up.yml` | Edited: added 3 from udagawa2025bias's reference list; added udagawa2025bias to the sources of 2 existing entries | |
| 2026-11-04 | `readings/longpre2024pretrainers.md` | Drafted reading summary from the ACL Anthology PDF (2024.naacl-long.179); added the citekey to EVAL-01, EVAL-02, EVAL-03, EVAL-06, ARCH-04, DET-04 | |
| 2026-11-04 | `readings/follow-up.yml` | Edited: added 1 from longpre2024pretrainers's reference list; added longpre2024pretrainers to the sources of 1 existing entries | |
| 2026-11-04 | `readings/gallegos2024bias.md` | Drafted reading summary from the MIT Press PDF (coli_a_00524); added the citekey to DET-01, DET-06, EVAL-02, MET-01, EVAL-01 | |
| 2026-11-04 | `readings/warner2025smarter.md` | Drafted reading summary from the ACL Anthology PDF (2025.acl-long.127); added the citekey to DET-02, ARCH-04, ARCH-05, CI-03, MET-06 | |
| 2026-11-04 | `readings/tian2023just.md` | Drafted reading summary from the ACL Anthology PDF (2023.emnlp-main.330); added the citekey to DET-04, DET-05, MET-02, MET-05, MET-06 | |
| 2026-11-04 | `readings/parrish2022bbq.md` | Drafted reading summary from the ACL Anthology PDF (2022.findings-acl.165); added the citekey to EVAL-02, MET-01, VAL-01, ETH-02 | |
| 2026-11-04 | `readings/kirk2022handling.md` | Drafted reading summary from the ACL Anthology PDF (2022.findings-emnlp.35); added the citekey to ETH-01, ETH-02, VAL-01, UI-01, UI-02 | |
| 2026-11-04 | `readings/arango2019hate.md` | Drafted reading summary from the ACM PDF (3331184.3331262); added the citekey to DET-03, VAL-01, MET-05, EVAL-03 | |
| 2026-11-04 | `readings/yin2021generalisable.md` | Drafted reading summary from the PeerJ PDF (peerj-cs-598); added the citekey to DET-03, VAL-01, MET-05, EVAL-06 | |
| 2026-11-04 | `readings/pavlopoulos2020toxicity.md` | Drafted reading summary from ACL Anthology PDF; added the citekey to ARCH-04, DET-03 | |
| 2026-11-04 | `readings/caselli2021hatebert.md` | Drafted reading summary from ACL Anthology PDF; added the citekey to DET-02, ARCH-05 | |
| 2026-11-04 | `readings/garg2019counterfactual.md` | Drafted reading summary from ACM PDF; added the citekey to VAL-01, MET-05, DET-03 | |
| 2026-11-04 | `readings/dev2021harms.md` | Drafted reading summary from ACL Anthology PDF; added the citekey to MET-01, VAL-01, ETH-01 | |
| 2026-11-04 | `readings/gururangan2022whose.md` | Drafted reading summary from ACL Anthology PDF; added the citekey to DET-01, EVAL-01 | |
| 2026-11-04 | `readings/mitchell2019model.md` | Drafted reading summary from ACM PDF; added the citekey to DET-03, MET-04, MET-05, UI-01 | |
| 2026-11-04 | `readings/hardt2016equality.md` | Drafted reading summary from NeurIPS PDF (Zotero storage); added the citekey to MET-05, MET-04, MET-02 | |
| 2026-11-04 | `readings/katzman2023taxonomizing.md` | Drafted reading summary from AAAI PDF (Zotero storage); added the citekey to DET-01, MET-05, EVAL-02 | |
| 2026-11-04 | `readings/lundberg2017unified.md` | Drafted reading summary from arXiv v2 PDF; added the citekey to UI-02, EVAL-04 | |
| 2026-11-04 | `readings/ribeiro2016why.md` | Drafted reading summary from ACM PDF; added the citekey to UI-02, EVAL-04, VAL-03 | |
| 2026-11-04 | `readings/nielsen1990heuristic.md` | Drafted reading summary from ACM PDF (1990 scan); added the citekey to VAL-03, ETH-01, ARCH-01 | |
| 2026-11-04 | `readings/pruitt2003personas.md` | Drafted reading summary from ACM PDF; added the citekey to ARCH-01, VAL-03, UI-01 | |
| 2026-11-04 | `readings/coefficient.md` | Drafted reading summary from SAGE PDF (scan); added the citekey to VAL-01, DET-06 | |
| 2026-11-04 | `readings/breckdata.md` | Drafted reading summary from PDF (Zotero storage); added the citekey to CI-01, ARCH-02, CI-02, MET-04, MET-03 | |
| 2026-11-04 | `readings/article.md` | Drafted reading summary from AI Act Service Desk snapshot (Zotero); added the citekey to MET-01, ARCH-02, ARCH-03, ETH-02 | |
| 2026-11-04 | `readings/follow-up.yml` | Edited: added 1 from article's reference list | |
| 2026-11-04 | `readings/bookeisbelectronic.md` | Drafted reading summary from eISB snapshot (Zotero); added the citekey to MET-01, DET-06, VAL-01 | |
| 2026-11-04 | `readings/follow-up.yml` | Edited: added 1 from bookeisbelectronic's reference list | |
| 2026-11-04 | `readings/dixon2018measuring.md`, `readings/mendu2025safer.md` | Edited: added MET-01, VAL-01 (Dixon) and MET-02 (Mendu) to `decisions:`, where the decisions cite them; added the citekeys to those decisions | |
| 2026-11-04 | `decisions/` (ARCH-05, DET-02, DET-03, DET-06, ETH-02, EVAL-02, EVAL-04, MET-01, MET-05, UI-02, VAL-01) | Edited: added a Resources section with official dataset, model and tool links, each checked to resolve | |
| 2026-11-04 | `PLAN.md` (§2, §4, §8, new §9) | Edited: added Stage 10 (Experiments) from Julia's spec, reformatted as markdown, with a dated note on the XAI repo's commit history | |
| 2026-11-04 | `experiments/README.md`, `experiments/_template.md`, `README.md` (repo map) | Drafted the experiments index and rules; copied the template from PLAN.md §9.4 | |
| 2026-11-04 | `experiments/EXP-01-identity-mentions/` `code/`, `results/`; `experiments/EXP-02-report-and-counter/` `code/`, `data/`, `results/` | Copied, unmodified, from MistorRonan/ISE-XAI-Group-10 at 9a66644 (Julia's notebooks and results) | |
| 2026-11-04 | `experiments/EXP-01-identity-mentions/README.md`, `requirements.txt` | Drafted the experiment record from the notebook and results CSVs; provenance from the source repo's git history | |
| 2026-11-04 | `experiments/EXP-02-report-and-counter/README.md`, `requirements.txt` | Drafted the experiment record from the notebook and results CSVs; provenance from the source repo's git history | |
| 2026-11-04 | `experiments/EXP-03-false-positive-rates/code/fp_rates.py` | Edited: tidied the Appendix A script (argparse, docstring, names, EXP-01/EXP-02 labels); checked its output against the original script and Appendix B | |
| 2026-11-04 | `experiments/EXP-03-false-positive-rates/results/` | Generated by running `fp_rates.py`; not hand-edited | |
| 2026-11-04 | `experiments/EXP-03-false-positive-rates/README.md`, `requirements.txt` | Drafted the experiment record from the results CSVs | |
| 2026-11-04 | `scripts/check.mjs`, `scripts/check.test.mjs`, `package.json`, `.github/workflows/check.yml` | Edited the check to validate experiments (§9.5 Step 5) and add them to status.json and the README status line; drafted fixture tests (`npm test`), run in CI | |
