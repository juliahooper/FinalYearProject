# Paper

Two reports, both in the IEEE two-column conference template with UL Cite It Right referencing:

| Report | Due | Folder | Word limit |
|---|---|---|---|
| Interim report | 06/11/2026 | `interim/` | **To be confirmed with supervisor** |
| Final report and video | 07/04/2027 | `final/` | 10,000 words maximum, including the reference list; more than 10% over is penalised (FYP spec) |

## Where things are

| Folder or file | What it is |
|---|---|
| `shared/preamble.tex` | Class options, packages, the Cite It Right biblatex set-up and the `\todo{}` macro. Used by both reports. |
| `shared/metadata.tex` | Name, student ID, supervisor and project title. Used by both reports. |
| `shared/figures/` | Figures used by either report. |
| `interim/main.tex`, `interim/sections/*.tex` | The interim report: abstract, introduction, background, related work, methodology, **work to date**, **project plan**, declarations. |
| `final/main.tex`, `final/sections/*.tex` | The final report: abstract, introduction, background, related work, methodology, deliverable, analysis, conclusion, declarations. |
| `notes/*.md` | Rough working notes, one file per section ID, shared by both reports (edited in the app later). Never used by either build. |
| `drafts/` | Dated PDF snapshots of each report (see `drafts/README.md`). |
| `REFERENCING.md` | How Cite It Right is set up in biblatex, and what still needs checking. |

The comment block at the top of every section file says what that section must cover, from the marking guide and rubric in the FYP spec.

## Interim and final sections are separate files

The two reports don't share section text. Interim text gets revised for the final report, so the same file can't serve both.

**After the interim report is submitted**, ask Claude Code to copy `interim/sections/` into `final/sections/` as a starting point for the final report. The interim-only sections (work to date, project plan) don't carry over directly. Their useful parts feed the final report's methodology, deliverable and conclusion.

## Writing

- Replace the pink `\todo{...}` lines with your text.
- Cite with `\parencite{key}` → (Author Year) or `\textcite{key}` → Author (Year). Page numbers go in square brackets: `\parencite[4]{key}`. The keys are the reading filenames in `readings/`.
- Escape `%`, `&`, `_` and `#` as `\%`, `\&`, `\_` and `\#`.

## Getting the PDFs

Every push that changes a report builds it on GitHub: **Actions** tab → **Build paper** → latest run → **Artifacts** → `interim-pdf` or `final-pdf`. Only the report whose folder changed is rebuilt. A change to `shared/`, `references.bib` or the workflow rebuilds both, and so does clicking **Run workflow** by hand.

To build locally (MiKTeX is installed), run `latexmk -pdf main.tex` inside `interim/` or `final/`. latexmk runs biber automatically.

**If a build fails:** open the run, then that report's "Compile LaTeX" step, and find the first line starting with `!`. The usual causes are an unescaped special character, a citation key that isn't in `references.bib`, or a missing `}`.

## Word count

Each build prints a word count on the run's **Summary** page. To count locally, run `bash scripts/wordcount.sh interim` (or `final`) from the repo root after building.

- **Body:** counted by texcount from the `.tex` files (text, headings and captions).
- **Total:** every word in the PDF before the declarations, so it includes the reference list. This is the number to check against the limit. It slightly overcounts, because it also includes the title block.
- The **declarations** are left out of both counts. Confirm with Colin that this is right.

## Before submitting

- [ ] No pink `[TODO]` text left in the PDF.
- [ ] Within the word limit (interim: to be confirmed; final: 10,000 including references).
- [ ] Every reference is cited in the text and checked against the real paper.
- [ ] The generative AI declaration and Colin's permission email are in `sections/declarations.tex` (see `../ai-use.md`).
- [ ] The academic integrity and plagiarism declaration is included (required in both reports).
- [ ] The submitted PDF is saved in `drafts/`.
