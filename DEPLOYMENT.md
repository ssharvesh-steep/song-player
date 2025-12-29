# Deployment Guide

## Option 1: Vercel (Recommended)

Since you have already pushed your code to GitHub, the easiest way to deploy is via Vercel's GitHub Integration.

1.  **Log in to Vercel:** Go to [vercel.com](https://vercel.com) and log in.
2.  **Add New Project:** Click **"Add New..."** -> **"Project"**.
3.  **Import Repository:**
    *   Find your repo `song-player` in the list.
    *   Click **"Import"**.
4.  **Configure Project:**
    *   **Framework Preset:** Next.js (Default).
    *   **Build Command:** `npm run build` (or default).
    *   **Output Directory:** `out` (Because we are using `output: 'export'`).
        *   *Note: If Vercel doesn't detect `out` automatically, you may need to override the Output Directory settings.*
5.  **Environment Variables:**
    *   Add your Supabase keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Environment Variables section.
6.  **Deploy:** Click **"Deploy"**.

### Alternative: Vercel CLI
If you prefer the command line:

1.  Run the following command in your terminal:
    ```bash
    npx vercel
    ```
2.  Follow the prompts:
    *   Log in (it will open your browser).
    *   "Set up and deploy?": **Yes** (`Y`)
    *   "Link to existing project?": **No**
    *   "Project Name": `song-player` (or your choice)
    *   "Directory?": `./` (Default)
    *   **Important:** It might ask to override settings. ensure Output Directory is detected or set to `out`.

---

## Option 2: GitHub Pages (Already Configured)

Your project is currently live at:
[https://ssharvesh-steep.github.io/song-player/](https://ssharvesh-steep.github.io/song-player/)

To update it in the future:
```bash
npm run deploy
```

## Configuration Note

Your `next.config.mjs` is set to `output: 'export'` for compatibility with GitHub Pages. This works perfectly on Vercel too, serving your app as a fast Static Site.
