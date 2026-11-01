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

The editing screens arrive in stages 5–7. This page will grow with them.
