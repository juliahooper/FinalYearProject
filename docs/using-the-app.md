# Using the app

The app is a website for reading and editing the readings, decisions and report notes in this repo. It has no database of its own: it reads the repo through GitHub, and every save is a commit.

## Sign in

The app uses a **fine-grained GitHub token** that only works for this repo.

1. Go to GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token** (direct link: github.com/settings/personal-access-tokens/new).
2. Name it "FYP app" and choose an expiry date. When it expires, the app asks for a new one.
3. **Repository access:** choose **Only select repositories** and pick `FinalYearProject`.
4. **Permissions → Repository permissions:** set **Contents** to **Read and write**. **Metadata: Read-only** is added automatically.
5. Click **Generate token**, copy it, and paste it into the app's sign-in page.

The token is stored in that browser only (in local storage). **Sign out**, at the bottom of the sidebar, removes it. Each new browser or device needs the token pasted in once.

## Run it on your laptop

You need Node.js (already installed).

```
cd app
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

## Deploy on Vercel (once)

1. Sign in at vercel.com with your GitHub account (the free Hobby plan is enough).
2. Click **Add New… → Project**, and import `juliahooper/FinalYearProject`. If it isn't listed, click **Adjust GitHub App Permissions** and give Vercel access to this repo.
3. On the configure screen:
   - **Root Directory:** `app`
   - **Framework Preset:** Vite (usually detected automatically)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**. When it finishes, Vercel shows the site's address (something like `fyp-research.vercel.app`). Add it to the README's Links section.

After that, every push to `main` redeploys the site automatically.

**Does the site need a password?** It's optional. The deployed site contains only the app's code: no readings, notes or other repo data. Everything is loaded from GitHub after you paste your token, and the site asks search engines not to index it. Vercel's password protection is a paid feature. The free "Vercel Authentication" setting (Project → Settings → Deployment Protection) protects preview deployments only.

## Saving and conflicts

- Saving is always explicit: the **Save** button or Ctrl+S (Cmd+S on a Mac). Each save is one commit, named `app: update <file>`.
- If a file changed on GitHub since you opened it (for example, Claude Code committed a reading), the save stops with: "This file changed on GitHub since you opened it. Reload it to see the latest version, or copy your text first." The app never overwrites silently.
- Unsaved edits are kept in the browser and restored if you reload.

## Readings

**Finding a reading**

- The search box searches titles, authors, the TL;DR and the five question answers. Matching words are highlighted in the list.
- The filter chips narrow the list by tags, minimum stars, status, decision, report section and verified. Active filters show as pills under the chips; click × to remove one. Filters stay in the page address, so a filtered list can be bookmarked.
- The sort menu orders by date added (the default), stars, year or title. While searching, the default is best match.
- An orange dot next to a reading means it hasn't been verified yet.

**Reading a note**

- The header shows the authors, venue and year, and an **Open paper** link (DOI or URL).
- Click the stars or change the status to save straight away, without opening the editor. Click the current star again to clear the rating.
- Decision chips open that decision. Diagrams and formulas are drawn in the page.
- While a note is still Claude's unverified draft, a banner says so. When you've checked it against the PDF, click **Mark as verified**. That sets `verified: true` and `status: verified`, and fills in today's date in the "Verified by Julia" column of `ai-use.md`.
- **Expand** hides the list for a wider reading view.

**Editing a note**

- Click **Edit**. The top of the page has stars, status, tags (with **Add new tag**, which adds it to `tags.yml` in the next pastel colour), decisions, report sections and "Found via".
- The note itself is a rich text editor: bold, italic, headings, lists, links and tables from the toolbar. Diagram and formula blocks show as code while editing.
- Save with the **Save** button or Ctrl+S (Cmd+S on a Mac). Only the lines you changed are rewritten, so the commit on GitHub shows just your edits.
- Unsaved changes are kept in the browser as you type. If you close the tab, they're offered back next time you open the editor.

**New reading**

Click **New reading**, pick a paper from `references.bib` that doesn't have a note yet, and click **Create**. The title, authors, year, venue and DOI are copied from Zotero, and the note starts from the template. You need to push `references.bib` to GitHub first, so the app can see the new paper.

**To read next**

The **To read next** tab lists the follow-up papers from `readings/follow-up.yml`, grouped by priority, with why each one is worth reading and where it was recommended. When you've saved one to Zotero, click **Saved to Zotero** and pick its citekey. If you decide against one, click **Skip**. **Show done** brings back the saved and skipped ones.

## Decisions

- The list shows every decision grouped by area (System design, Detector, Metrics, CI/CD, Reporting, Validation, Impact evaluation, Governance), with how many in each group are decided. The bar at the top shows progress across all of them.
- Click a decision to open it. The reader shows its whole group as collapsible sections, with the one you picked open: its question, options, decision, why and consequences, then the readings behind it. Click the open heading again to collapse it.
- **Status** saves straight away. Choosing **Decided** fills in `decided_on` with today's date; moving a decision back to Open or Exploring clears it.
- **Edit** opens the title, status and the five sections in the rich text editor. Save with the button or Ctrl+S, as with readings. Changing the title doesn't rename the file, so links keep working.
- **Readings panel:** lists every reading that informs the decision, with stars and the start of its TL;DR. **Link a reading** adds the decision to the reading's `decisions:` and the reading to the decision's `readings:`, as two commits. **Unlink** removes both.
- **New decision:** pick a group and the next free ID is assigned (for example MET-07), then give it a title and, optionally, its question.

## Report notes

Rough working notes for each report section, kept in `paper/notes/` and never used by the LaTeX build.

- The **Interim / Final** switch at the top chooses the report. It starts on the report whose deadline is next: interim up to and including 06/11/2026, then final. Each section shows its marks (none for interim-only sections), how many words of notes it has, and how many readings are tagged with it.
- The notes are shared between the reports. "Methodology" is the same notes file whether Interim or Final is selected, so notes written for the interim carry over.
- **What this section needs** (click to open) summarises what the marking guide and rubric expect from that section. It's read from the comment block at the top of the section's `.tex` file, so it always matches the report.
- The notes are always in the rich text editor. Save with the **Save** button or Ctrl+S; **Cancel** discards unsaved changes. Unsaved changes are kept in the browser, as with readings.
- The **readings panel** on the right lists readings tagged with this section, best first:
  - **Cite** inserts `\parencite{key}` at the cursor (or at the end, if you haven't clicked into the notes yet).
  - **Copy cite** copies `\textcite{key}` to paste into a `.tex` file.
  - **Open** opens the reading.
  - **Hide readings** collapses the panel for more writing space.

The dashboard and guide arrive in stage 8. This page will grow with them.
