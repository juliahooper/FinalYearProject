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
