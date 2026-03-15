# DevPulse — Free Tier Setup Guide
# Everything needed to build and deploy DevPulse for $0
# Last updated: March 2026

---

## What you need to register (in order)

1. MongoDB Atlas — database
2. GitHub OAuth App — login system
3. Groq API — primary AI
4. Anthropic API — AI fallback
5. Render — backend hosting
6. Vercel — frontend hosting

Do steps 1–4 before writing any code.
Do steps 5–6 only when ready to deploy (Week 4).

---

## Step 1 — MongoDB Atlas (your database, free forever)

1. Go to https://cloud.mongodb.com and sign up
2. Choose **M0 FREE** — make sure it says $0/month
3. Pick any cloud provider (AWS is fine) and pick a region
4. Database User: `devpulse` / Auto-generated password
5. Network Access: Add `0.0.0.0/0` (Allow all for Render)
6. Connection String: `mongodb+srv://devpulse:<password>@cluster0.xxxxx.mongodb.net/devpulse`

---

## Step 2 — GitHub OAuth App (the login system)

1. Go to https://github.com/settings/developers
2. New OAuth App:
   - **Homepage**: `http://localhost:3000`
   - **Callback**: `http://localhost:5000/api/v1/auth/github/callback`
3. Copy **Client ID** and **Client Secret**.

---

## Step 3 — Groq API (primary AI)

1. Go to https://console.groq.com
2. Get API Key: `gsk_...`
3. Model: `llama-3.3-70b-versatile`

---

## Step 4 — Anthropic API (fallback AI)

1. Go to https://console.anthropic.com
2. Get API Key: `sk-ant-...`
3. Model: `claude-haiku-4-5-20251001`

---

## Step 5 — Secrets (.env)

`npm run secret` (or use the node crypto command) to generate `SESSION_SECRET` and `JWT_SECRET`.

---

## Step 6 — Deployment (Week 4)

- **Render**: Backend hosting. Add env vars for MONGO_URI, GITHUB_*, etc.
- **Vercel**: Frontend hosting. Add VITE_API_URL.
