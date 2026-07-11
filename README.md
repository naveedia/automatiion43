# Daily Signal — a free, self-publishing blog

A Next.js blog that writes and publishes one new post a day, on its own,
running entirely on free tiers: **Vercel** (hosting + cron), **GitHub**
(code + content storage), and your **own domain**.

Cost: **$0/month**, unless you opt into a paid AI key later (optional).

---

## How it works

1. Once a day, Vercel's built-in Cron feature calls `/api/cron/generate`.
2. That function picks the next topic from `site.config.js`, writes a post,
   and commits it straight to your GitHub repo as a `.md` file.
3. The new commit triggers Vercel's normal auto-deploy — the post goes live
   a minute or two later. No servers, no database, nothing to babysit.

Posts are plain Markdown files with frontmatter, stored in `content/posts/`.
The generator has two modes:

- **Free template mode** (default, $0): rotates through headline angles and
  topic-agnostic sections. Good enough to keep a site active; not going to
  win awards.
- **AI mode** (optional): set `GEMINI_API_KEY` (free tier at
  [ai.google.dev](https://ai.google.dev)) and posts are written by Gemini
  instead — same pipeline, no code changes needed.

---

## Setup (about 15 minutes)

### 1. Push this project to GitHub

```bash
cd daily-blog
git init
git add .
git commit -m "Initial commit"
```

Create a new empty repo at [github.com/new](https://github.com/new) (public
or private, either works), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. Import the repo into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Import the repo you just pushed. Framework preset auto-detects as Next.js
   — leave defaults as-is and click **Deploy**.
3. Your site is now live at `your-project.vercel.app`.

### 3. Connect your domain

In the Vercel project → **Settings → Domains** → add your domain. Vercel
shows you either an A record or CNAME to add at your domain registrar (this
is free — Vercel doesn't charge for custom domains on the Hobby plan).
DNS usually propagates within a few minutes to a few hours.

### 4. Create a GitHub token (so the cron job can commit posts)

1. GitHub → **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**.
2. Repository access: only the repo you created above.
3. Permissions: **Contents → Read and write**. Nothing else needed.
4. Copy the token — you won't see it again.

### 5. Add environment variables in Vercel

Project → **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `GITHUB_TOKEN` | the token from step 4 |
| `GITHUB_OWNER` | your GitHub username |
| `GITHUB_REPO` | the repo name |
| `GITHUB_BRANCH` | `main` |
| `CRON_SECRET` | any random string (e.g. run `openssl rand -hex 32`) |
| `GEMINI_API_KEY` | *(optional)* your free Gemini key, only if you want AI-written posts |

Redeploy once after adding these (Vercel → Deployments → ⋯ → Redeploy).

### 6. The daily cron is already configured

`vercel.json` in this project already declares the schedule:

```json
{ "crons": [{ "path": "/api/cron/generate", "schedule": "0 8 * * *" }] }
```

That's 08:00 UTC daily. Vercel's Hobby (free) plan allows cron jobs that run
once a day, which is exactly what this needs — nothing more to configure.
Change the schedule string any time (it's a standard cron expression) and
redeploy.

You can also trigger it manually any time to test:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/cron/generate
```

---

## Customizing

Everything content-related lives in **`site.config.js`**:

```js
module.exports = {
  siteName: "The Daily Signal",
  tagline: "One dispatch a day, on what's moving.",
  topics: [ "remote work culture", "personal finance habits", ... ]
};
```

Change the name, tagline, or the topic list — no other file needs to change.
The generator cycles through `topics` in order and loops back to the start.

To test new topics or tweak `lib/generate.js` without deploying:

```bash
npm install
npm run generate:local   # writes a real post into content/posts
npm run dev               # view it at localhost:3000
```

---

## Upgrading content quality later

The free template generator is intentionally simple. When you're ready for
real AI-written posts, either:

- Add `GEMINI_API_KEY` (free tier, generous daily quota) — zero code changes, or
- Swap the prompt/model in `lib/generate.js`'s `geminiPost()` function for
  any other provider (Anthropic, OpenAI, etc.) if you'd rather pay for higher
  quality — it's a single `fetch` call to replace.

---

## Project structure

```
app/
  page.js                    home feed
  blog/[slug]/page.js        individual post
  api/cron/generate/route.js the daily job
content/
  posts/*.md                 your posts (frontmatter + markdown)
  state.json                 tracks which topic/dispatch number is next
lib/
  generate.js                content generator (template + optional Gemini)
  github.js                  commits files to your repo via GitHub's API
  posts.js                   reads posts for the site to render
site.config.js                name, tagline, topic list
vercel.json                   cron schedule
```
