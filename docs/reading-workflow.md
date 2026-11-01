# Reading workflow

How a paper goes from a database search to a verified reading note in `readings/`. The research methods lecture (29/10/2026) suggests aiming for about 30 papers.

## Part 1: set up Zotero (once)

1. **Install Zotero** from zotero.org, plus the **Zotero Connector** for your browser.
2. **Install Better BibTeX.** Download the latest `.xpi` file from the Better BibTeX releases page on GitHub (retorquere/zotero-better-bibtex). In Zotero, go to **Tools → Plugins**, click the gear icon, choose **Install Plugin From File…**, pick the `.xpi`, and restart Zotero.
3. **Set the citation key formula.** Go to **Edit → Settings → Better BibTeX → Citation keys**, and set the citation key formula to:

   ```
   auth.lower + year + shorttitle(1,0).lower
   ```

   This gives keys like `nangia2020crows` (first author, year, first word of the title). Whatever key Zotero shows in an item's **Citation Key** field is the key to use everywhere.
4. **Create a collection called `FYP`.** Right-click **My Library** and choose **New Collection…**. Save every project paper into it.
5. **Export it to the repo, kept updated.** Right-click the `FYP` collection, choose **Export Collection…**, set the format to **Better BibLaTeX**, tick **Keep updated**, and click OK. Save it in the repo root (`FinalYearProject/`) as **`references.bib`**, replacing the empty file that's there.

   Zotero now rewrites `references.bib` whenever the collection changes. Never edit it by hand. Commit it along with the reading notes. You can see or remove the automatic export under **Edit → Settings → Better BibTeX → Automatic export**.

## Part 2: each reading

### 1. Find a paper

Use the databases from the FYP lectures:

- **IEEE Xplore** (the one the research methods lecture uses)
- ACM Digital Library
- Scopus
- Google Scholar
- arXiv (open access, but preprints may not be peer reviewed)

UL library access to all of these is at libguides.ul.ie/az.php.

To judge quality, check conference rankings on the **CORE portal** (portal.core.edu.au/conf-ranks) and journal impact factors. Don't judge by these alone, because new venues have no ranking yet (FYP week 2). Also look for a systematic literature review on the topic, the main authors in the area, and any "seminal" paper that many others cite.

Note where you found each paper (for example `IEEE Xplore search "representational bias dataset"`). It goes in the `found_via` field.

### 2. Save it to Zotero

1. On the paper's page, click the Zotero Connector button. Check that it saved into the `FYP` collection with the right title, authors, year and venue. Fix them in Zotero if not, because the reading note copies them from `references.bib`.
2. For web-only sources, check that the **Accessed** date is filled in. The reference list needs it for "[accessed DD Mon YYYY]".
3. Copy the PDF into the repo: right-click the PDF attachment in Zotero, choose **Show File**, copy it into `readings/pdfs/`, and rename it to `<citekey>.pdf` (for example `nangia2020crows.pdf`).

   PDFs are git-ignored and never committed (publisher copyright), so Zotero stays the backup copy.

### 3. Ask Claude Code to summarise it

In VS Code, paste this prompt into Claude Code, with the citekey filled in:

```
Summarise the reading `<citekey>` following §7 of PLAN.md. The PDF is in readings/pdfs/. Don't guess anything that isn't in the PDF.
```

Claude creates `readings/<citekey>.md` from the template, marked `summarised_by: claude` and `verified: false`. It runs the checks, commits, and tells you a suggested star rating and anything it was unsure about. It writes `NOT FOUND IN SOURCE` wherever something isn't in the PDF.

### 4. Check Claude's draft against the PDF

Read the draft with the PDF open beside it.

- Fix anything wrong or overstated.
- Check **every number and every page reference** under "Key numbers".
- Check the one direct quote, if there is one, word for word.
- Fill in anything marked `NOT FOUND IN SOURCE` or `(p. ?)`, or delete it.

### 5. Set stars, tags, sections and decisions

- `stars`: 1–5 for how useful it is to this project (0 means not rated).
- `tags`: only tags from `tags.yml`.
- `sections`: the report sections it feeds (abstract, introduction, background, related-work, methodology, deliverable, analysis, conclusion).
- `decisions`: the decision IDs it informs, for example `[MET-02, VAL-01]`. Also add the citekey to the `readings:` list in those decision files.

### 6. Mark it as verified

Set `verified: true` and `status: verified`. Then, in `ai-use.md`, fill in the "Verified by Julia" date on the reading's row. Commit with `readings: verify <citekey>`.

Only you set `verified: true`.

### 7. Pick the next paper

Each summary's "Follow-up" papers are collected in [`readings/follow-up.yml`](../readings/follow-up.yml), with a priority and a reason. When you save one to Zotero, set its `status: saved` and `key: <citekey>`. If you decide against one, set `status: skipped`. The check warns you if a suggested paper appears in `references.bib` and you haven't marked it saved yet.

### 8. Skim-reading tip

From the research methods lecture, on reading 30 papers quickly:

1. Read the **abstract and conclusion** first.
2. Answer the note questions as far as you can.
3. **Skim the rest** to answer the remaining questions.

## The note questions

Each reading note answers the five per-paper note questions from the research methods lecture (slide 3):

1. What is the aim of the paper?
2. How did the authors carry out the research, i.e. methods?
3. What are the primary results?
4. What do the authors think the results mean (for question 1)?
5. What do you think it means?

Question 5 is your own view. If Claude drafted it, rewrite it in your own words when you verify the note.

The lecture's five framing questions for the FYP itself are on the README.
