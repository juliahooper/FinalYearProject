# Paper

The FYP report: IEEE two-column conference template with UL Cite It Right referencing. The limit is 10,000 words, including the reference list.

| File | What it is |
|---|---|
| `main.tex` | Template, title, referencing set-up; pulls in the section files. You shouldn't need to edit it often. |
| `sections/*.tex` | **One file per report section.** The comment block at the top says what the marking guide expects. |
| `notes/*.md` | Rough working notes per section (edited in the app later). Never used by the build. |
| `figures/` | Figures used in the paper. |
| `drafts/` | Dated PDF snapshots (see `drafts/README.md`). |
| `REFERENCING.md` | How Cite It Right is set up in biblatex, and what still needs checking. |

## Writing

- Replace the pink `\todo{...}` lines with your text.
- Cite with `\parencite{key}` → (Author Year) or `\textcite{key}` → Author (Year). Page numbers go in square brackets: `\parencite[4]{key}`. The keys are the reading filenames in `readings/`.
- Escape `%`, `&`, `_` and `#` as `\%`, `\&`, `\_` and `\#`.

## Getting the PDF

Every push that changes `paper/` or `references.bib` builds the PDF on GitHub: **Actions** tab → **Build paper** → latest run → **Artifacts** → `paper-pdf`.

To build locally (MiKTeX is installed), run `latexmk -pdf main.tex` in this folder. latexmk runs biber automatically.

**If the build fails:** open the run, then the "Compile LaTeX" step, and find the first line starting with `!`. The usual causes are an unescaped special character, a citation key that isn't in `references.bib`, or a missing `}`.

## Before submitting

- [ ] No pink `[TODO]` text left in the PDF.
- [ ] Under 10,000 words including references.
- [ ] Every reference is cited in the text and checked against the real paper.
- [ ] The AI declaration and Colin's permission email are included (see `../ai-use.md`).
- [ ] The academic integrity and plagiarism declaration is included.
- [ ] The final PDF is saved in `drafts/`.
