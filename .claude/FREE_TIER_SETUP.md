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

1. Go to https://cloud.mongodb.com and sign up (use Google if you want)
2. After signup, you land on the project dashboard
3. Click **"Build a Database"** (big green button)
4. Choose **M0 FREE** — make sure it says $0/month
5. Pick any cloud provider (AWS is fine) and the region closest to you
6. Click **"Create"**
7. A popup appears: **"Security Quickstart"**
   - Username: pick something simple like `devpulse`
   - Password: click "Autogenerate" and **copy it immediately**
   - Click **"Create User"**
8. Under "Where would you like to connect from?" choose **"My Local Environment"**
   - Click **"Add My Current IP Address"**
   - Also add `0.0.0.0/0` to allow all IPs (needed for Render deployment later)
   - Click **"Add Entry"** then **"Finish and Close"**
9. Back on the dashboard, click **"Connect"** on your cluster
10. Choose **"Drivers"** → Node.js → copy the connection string
    - It looks like: `mongodb+srv://devpulse:<password>@cluster0.xxxxx.mongodb.net/`
    - Replace `<password>` with your actual password
    - Add `devpulse` at the end: `...mongodb.net/devpulse`
11. This is your `MONGO_URI` — save it in your `.env`

---

## Step 2 — GitHub OAuth App (the login system)

1. Go to https://github.com/settings/developers
2. Click **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"** (top right)
4. Fill in:
   - **Application name**: DevPulse
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:5000/api/v1/auth/github/callback`
   - Description: optional
5. Click **"Register application"**
6. You now see your app's page:
   - Copy **Client ID** → this is `GITHUB_CLIENT_ID`
   - Click **"Generate a new client secret"** → copy it immediately → `GITHUB_CLIENT_SECRET`
   - **Warning**: GitHub only shows the secret once. If you lose it, regenerate.
7. Save both in your `.env`

> When you deploy to Render later, come back here and add a second callback URL:
> `https://your-render-app.onrender.com/api/v1/auth/github/callback`

---

## Step 3 — Groq API (primary AI, very generous free tier)

1. Go to https://console.groq.com
2. Sign up — no credit card needed
3. In the dashboard, click **"API Keys"** in the left sidebar
4. Click **"Create API Key"**
5. Give it a name: `devpulse`
6. Copy the key (starts with `gsk_`) → this is `GROQ_API_KEY`
7. Save in your `.env`

Free limits as of 2026:
- llama-3.3-70b-versatile: 6,000 tokens/minute, 14,400 requests/day
- This is more than enough for DevPulse's batch processing

Model to use: `llama-3.3-70b-versatile`

---

## Step 4 — Anthropic API (fallback AI, $5 free credit)

1. Go to https://console.anthropic.com
2. Sign up (credit card required to verify, but you get $5 free and won't be charged)
3. Go to **"API Keys"** → **"Create Key"**
4. Name it: `devpulse-fallback`
5. Copy the key (starts with `sk-ant-`) → this is `ANTHROPIC_API_KEY`
6. Save in your `.env`

Model to use: `claude-haiku-4-5-20251001`
Cost: $0.25 per million input tokens — $5 credit = 20 million tokens.
As a fallback that rarely triggers, this will last many months.

---

## Step 5 — Generate your secret strings

Open your terminal and run this command twice — once for each secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

First output → `SESSION_SECRET`
Second output → `JWT_SECRET`

These must be different from each other. Never share them or commit them to git.

---

## Step 6 — Create your .env file

In the `server/` folder, create a file called `.env` (not `.env.example`, the actual `.env`):

```bash
# Server
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://devpulse:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/devpulse

# Secrets (generated in Step 5)
SESSION_SECRET=paste_first_generated_string_here
JWT_SECRET=paste_second_generated_string_here
JWT_EXPIRES_IN=7d

# GitHub OAuth (from Step 2)
GITHUB_CLIENT_ID=paste_client_id_here
GITHUB_CLIENT_SECRET=paste_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:5000/api/v1/auth/github/callback

# Groq API (from Step 3)
GROQ_API_KEY=gsk_paste_your_groq_key_here

# Anthropic API (from Step 4)
ANTHROPIC_API_KEY=sk-ant-paste_your_anthropic_key_here

# CORS — frontend URL
CLIENT_URL=http://localhost:3000
```

Also create `client/.env`:
```bash
VITE_API_URL=http://localhost:5000
```

---

## Step 7 — Verify your .gitignore

Make sure `.env` is in your `.gitignore` BEFORE making any git commits.
In the root `.gitignore`:
```
.env
node_modules/
dist/
.DS_Store
```

---

## Step 8 — Render (backend deployment — do this in Week 4)

1. Go to https://render.com and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: devpulse-api
   - **Root Directory**: server
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: Free
5. Scroll down to **"Environment Variables"**
   - Add every variable from your server `.env` file
   - Update `GITHUB_CALLBACK_URL` to: `https://devpulse-api.onrender.com/api/v1/auth/github/callback`
   - Update `CLIENT_URL` to your Vercel URL (you'll get this in the next step)
   - Add `NODE_ENV=production`
6. Click **"Create Web Service"**
7. Copy the URL Render gives you (e.g. `https://devpulse-api.onrender.com`)

---

## Step 9 — Vercel (frontend deployment — do this in Week 4)

1. Go to https://vercel.com and sign up with GitHub
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: client
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected for Vite)
5. Under **"Environment Variables"**:
   - `VITE_API_URL` = `https://devpulse-api.onrender.com`
6. Click **"Deploy"**
7. Create a `vercel.json` file in the `client/` folder to fix React Router:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Without this, refreshing any page other than `/` returns a 404.

---

## Also: go back to GitHub and add the production callback URL

1. Go to https://github.com/settings/developers → your DevPulse OAuth App
2. Under **"Authorization callback URL"**, add the production URL below the dev one:
   `https://devpulse-api.onrender.com/api/v1/auth/github/callback`
3. Save

---

## Full cost table

| Service       | Free limit             | Estimated DevPulse usage | Monthly cost |
|---------------|------------------------|--------------------------|--------------|
| MongoDB Atlas | 512MB, shared cluster  | ~50MB                    | $0           |
| Render        | 750 hours/month        | ~720 hours               | $0           |
| Vercel        | 100GB bandwidth        | ~1GB                     | $0           |
| Groq API      | ~14,400 requests/day   | ~100 requests/day        | $0           |
| Anthropic     | $5 credit (one-time)   | Fallback only            | ~$0          |
| GitHub API    | 5,000 requests/hour    | ~500/day                 | $0           |
| **Total**     |                        |                          | **$0**       |
