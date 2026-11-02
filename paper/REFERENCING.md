# Referencing: UL Cite It Right in biblatex

The FYP spec asks for the IEEE conference template **and** UL Cite It Right (Harvard) referencing. So the paper uses the IEEEtran layout but replaces IEEE numbered references with biblatex `authoryear`, adjusted towards Cite It Right in `shared/preamble.tex`, which both the interim and final reports use.

The model for the reference format is the reference on the signed proposal form:

> Pikuliak, M. (2025) 'GenderBench: evaluation suite for gender biases in LLMs', arXiv:2505.12054, available: https://arxiv.org/abs/2505.12054 [accessed 07 Oct 2026].

A test build with that entry produced exactly this line.

## What is set up

| Cite It Right | How it's done |
|---|---|
| In text: (Author Year) | `\parencite{key}` → (Pikuliak 2025) |
| Author as part of the sentence | `\textcite{key}` → Pikuliak (2025) |
| Page numbers: (Author Year, p. X) | `\parencite[4]{key}` → (Pikuliak 2025, p. 4) |
| 3+ authors: "et al." in text | `maxcitenames=2` → (Nangia et al. 2020) |
| Reference list: Surname, I. | `giveninits=true`, family-given order for every author |
| "and" before the last author | e.g. Alpha, A., Beta, B. and Gamma, C. (2018) |
| No full stop after the year | `nametitledelim` is a space |
| Article and paper titles in single quotes | `\mkbibquote` with British `csquotes` |
| Journal, volume(issue), pages | e.g. Test Journal, 27(3), pp. 1–10 |
| available: URL [accessed DD Mon YYYY] | custom `url+urldate` macro |
| Year only, e.g. (2017) | `date=year`; Zotero exports full dates such as 2017-04-14 |
| No arXiv clutter | arXiv's "Comment: …" note and the "pre-published" label from Zotero are dropped |

## Differences that remain, to check with Colin

These are places where I'm not sure biblatex matches the official UL guide, or where I couldn't check the guide itself. The Cite It Right guide isn't in `course-materials/` yet. Adding it would let these be checked properly.

1. **All authors in the reference list.** It currently lists every author (`maxbibnames=99`). Check whether UL wants "et al." in the reference list after a certain number of authors.
2. **Conference papers.** These print as 'Title', *Proceedings title*, Place: Publisher, pages, with no "in". Check whether UL wants "in" before the proceedings title, or editors.
3. **DOIs.** These print as `DOI: 10.xxxx/...` at the end of the entry. Check whether UL prefers "available: https://doi.org/..." instead.
4. **Accessed dates** only appear when the Zotero item has its **Accessed** field filled in. Zotero sets it when you save from a web page. Check it for arXiv and other online sources.
5. **Same author, same year.** These become 2025a and 2025b automatically, which is standard Harvard, but check against the guide.
6. **Secondary citations** ("Smith 2010, cited in Jones 2020") have no automatic form. Write them as `\parencite[cited in][]{jones2020}` with Smith named in the text.
7. **Pages in the reference list** use "pp." and an en dash (pp. 1–10).

## Files

- The bibliography is `references.bib` in the repo root (`../../references.bib` from each report's `main.tex`), exported automatically from Zotero (see `docs/reading-workflow.md`). Don't edit it by hand, because Zotero overwrites it.
- Citation keys are the Better BibTeX keys, which are also the reading filenames in `readings/`.
